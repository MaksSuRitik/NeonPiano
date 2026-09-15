import test from 'node:test';
import assert from 'node:assert/strict';

function toFirestoreTrackKey(title) {
    try {
        return 'b64_' + Buffer.from(unescape(encodeURIComponent(title))).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    } catch (e) {
        return 'enc_' + encodeURIComponent(title).replace(/\./g, '%2E').replace(/\//g, '%2F');
    }
}

function fromFirestoreTrackKey(key, trackObj) {
    if (trackObj && typeof trackObj.title === 'string' && trackObj.title.trim()) {
        return trackObj.title.trim();
    }
    if (typeof key === 'string' && key.startsWith('b64_')) {
        try {
            let base64 = key.slice(4).replace(/-/g, '+').replace(/_/g, '/');
            while (base64.length % 4) base64 += '=';
            return decodeURIComponent(escape(Buffer.from(base64, 'base64').toString('utf8')));
        } catch (e) {}
    }
    return key;
}

// Model the sync algorithm from danceCore.js
function simulateSync({ cloudExists, cloudTracks, localStore, songsDB }) {
    let cloudSavedPayload = null;
    let localUpdated = false;

    const validSongTitles = new Set();
    songsDB.forEach(s => { if (s && s.title) validSongTitles.add(s.title); });

    const tracksToSync = new Set(validSongTitles);

    if (!cloudExists) {
        // Initial sync for new cloud account
        const initialTracks = {};
        tracksToSync.forEach(title => {
            const local = localStore[title] || { score: 0, stars: 0 };
            const safeKey = toFirestoreTrackKey(title);
            const score = Number(local.score) || 0;
            const stars = Number(local.stars) || 0;
            if (score > 0 || stars > 0) {
                initialTracks[safeKey] = {
                    title: title,
                    score: score,
                    stars: stars,
                    starTypes: local.starTypes || [0, 0, 0, 0, 0]
                };
            }
        });
        cloudSavedPayload = { tracks: initialTracks };
    } else {
        // Cloud exists: CLOUD IS SOURCE OF TRUTH
        tracksToSync.forEach(title => {
            const local = localStore[title] || { score: 0, stars: 0, starTypes: [] };
            const safeKey = toFirestoreTrackKey(title);

            let cloud = cloudTracks[safeKey] || null;
            if (!cloud) {
                for (const [ck, cv] of Object.entries(cloudTracks)) {
                    if (cv && (cv.title === title || fromFirestoreTrackKey(ck, cv) === title)) {
                        cloud = cv;
                        break;
                    }
                }
            }

            const localScore = Number(local.score) || 0;
            const localStars = Number(local.stars) || 0;

            if (cloud) {
                const cloudScore = Number(cloud.score) || 0;
                const cloudStars = Number(cloud.stars) || 0;
                let cloudTypes = Array.isArray(cloud.starTypes) ? cloud.starTypes.slice(0, 5) : [0, 0, 0, 0, 0];

                if (localScore !== cloudScore || localStars !== cloudStars) {
                    localStore[title] = {
                        title: title,
                        score: cloudScore,
                        stars: cloudStars,
                        starTypes: cloudTypes
                    };
                    localUpdated = true;
                }
            } else {
                // Missing in cloud: reset stale local score
                if (localScore > 0 || localStars > 0) {
                    localStore[title] = {
                        title: title,
                        score: 0,
                        stars: 0,
                        starTypes: [0, 0, 0, 0, 0]
                    };
                    localUpdated = true;
                }
            }
        });
        // Never overwrite cloud tracks on reload!
    }

    return { cloudSavedPayload, localUpdated, localStore };
}

// Model saveGameData logic
function simulateSaveGameData({ songTitle, newScore, newStars, localStore, cloudTracks }) {
    const current = localStore[songTitle] || { score: 0, stars: 0, starTypes: [0, 0, 0, 0, 0] };
    const finalScore = Math.max(newScore, current.score || 0);
    const finalStars = Math.max(newStars, current.stars || 0);

    const payload = {
        title: songTitle,
        score: finalScore,
        stars: finalStars,
        starTypes: [0, 0, 0, 0, 0]
    };

    localStore[songTitle] = payload;

    const safeKey = toFirestoreTrackKey(songTitle);
    cloudTracks[safeKey] = payload;

    return { finalScore, finalStars, payload };
}

test('Admin reset contract: cloud score 0 updates local storage to 0 and DOES NOT overwrite cloud on reload', () => {
    const song = { title: 'Test Phonk Beat' };
    const safeKey = toFirestoreTrackKey(song.title);

    // Stale local storage had high score
    const localStore = {
        [song.title]: { score: 500000, stars: 5, starTypes: [1, 1, 1, 1, 1] }
    };

    // Admin reset the score to 0 in cloud
    const cloudTracks = {
        [safeKey]: { title: song.title, score: 0, stars: 0, starTypes: [0, 0, 0, 0, 0], adminModifiedAt: Date.now() }
    };

    const result = simulateSync({
        cloudExists: true,
        cloudTracks,
        localStore,
        songsDB: [song]
    });

    // 1. Local store must be updated to 0
    assert.equal(result.localUpdated, true);
    assert.equal(result.localStore[song.title].score, 0);
    assert.equal(result.localStore[song.title].stars, 0);

    // 2. Cloud tracks must NOT have been overwritten
    assert.equal(result.cloudSavedPayload, null);
    assert.equal(cloudTracks[safeKey].score, 0);
});

test('New record contract: after admin reset to 0, playing the level saves new score as new record', () => {
    const song = { title: 'Test Phonk Beat' };
    const safeKey = toFirestoreTrackKey(song.title);

    // Local storage is 0 after syncing admin reset
    const localStore = {
        [song.title]: { score: 0, stars: 0, starTypes: [0, 0, 0, 0, 0] }
    };
    const cloudTracks = {
        [safeKey]: { title: song.title, score: 0, stars: 0, starTypes: [0, 0, 0, 0, 0] }
    };

    // Player plays and scores 85,000
    const saveResult = simulateSaveGameData({
        songTitle: song.title,
        newScore: 85000,
        newStars: 3,
        localStore,
        cloudTracks
    });

    assert.equal(saveResult.finalScore, 85000);
    assert.equal(saveResult.finalStars, 3);
    assert.equal(localStore[song.title].score, 85000);
    assert.equal(cloudTracks[safeKey].score, 85000);

    // Player refreshes page: 85,000 persists
    const reloadResult = simulateSync({
        cloudExists: true,
        cloudTracks,
        localStore,
        songsDB: [song]
    });

    assert.equal(reloadResult.localStore[song.title].score, 85000);
    assert.equal(cloudTracks[safeKey].score, 85000);
});

test('Admin score modification contract: custom baseline score behaves correctly on playthroughs', () => {
    const song = { title: 'Test Track' };
    const safeKey = toFirestoreTrackKey(song.title);

    // Admin sets baseline to 150,000
    const cloudTracks = {
        [safeKey]: { title: song.title, score: 150000, stars: 4, starTypes: [1, 1, 1, 1, 0] }
    };
    const localStore = {
        [song.title]: { score: 400000, stars: 5 } // stale local
    };

    // Page reload syncs admin 150,000
    simulateSync({ cloudExists: true, cloudTracks, localStore, songsDB: [song] });
    assert.equal(localStore[song.title].score, 150000);

    // Play with lower score 100,000 -> record remains 150,000
    const play1 = simulateSaveGameData({
        songTitle: song.title,
        newScore: 100000,
        newStars: 2,
        localStore,
        cloudTracks
    });
    assert.equal(play1.finalScore, 150000);

    // Play with higher score 220,000 -> record updates to 220,000
    const play2 = simulateSaveGameData({
        songTitle: song.title,
        newScore: 220000,
        newStars: 5,
        localStore,
        cloudTracks
    });
    assert.equal(play2.finalScore, 220000);
    assert.equal(cloudTracks[safeKey].score, 220000);
});

test('Missing cloud track resets stale local storage to prevent ghost scores', () => {
    const song = { title: 'Removed Track' };
    const localStore = {
        [song.title]: { score: 300000, stars: 4 }
    };
    const cloudTracks = {}; // Track removed/missing in cloud

    const result = simulateSync({
        cloudExists: true,
        cloudTracks,
        localStore,
        songsDB: [song]
    });

    assert.equal(result.localUpdated, true);
    assert.equal(result.localStore[song.title].score, 0);
    assert.equal(result.localStore[song.title].stars, 0);
});
