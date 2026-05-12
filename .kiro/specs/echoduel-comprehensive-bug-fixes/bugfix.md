# Bugfix Requirements Document

## Introduction

This document addresses four critical bugs identified in the EchoDuel multiplayer music game application that affect the core user experience. These bugs impact room creation/joining flow, room lifecycle management, profile photo display, and game configuration selection. The fixes will ensure proper player role assignment, room persistence, visual consistency, and configuration handling.

## Bug Analysis

### Bug 1: Room Creation/Joining - Host Waiting for Themselves

#### Current Behavior (Defect)

1.1 WHEN a user creates a room THEN the system displays "Waiting for host to start" message even though the creator IS the host

1.2 WHEN a user creates a room and navigates to the game page THEN the "Start Game" button is not immediately visible to the host

1.3 WHEN the room creator joins their own room via socket THEN the system treats them as a regular player instead of recognizing them as the host

#### Expected Behavior (Correct)

2.1 WHEN a user creates a room THEN the system SHALL immediately recognize them as the host and display "You are the Host. Click Start Game when ready."

2.2 WHEN a user creates a room and navigates to the game page THEN the "Start Game" button SHALL be immediately visible and functional

2.3 WHEN the room creator joins their own room via socket THEN the system SHALL match their identity using userId from JWT and correctly assign host privileges

#### Unchanged Behavior (Regression Prevention)

3.1 WHEN a non-host player joins a room THEN the system SHALL CONTINUE TO display "Connected to room. Waiting for host to start."

3.2 WHEN a non-host player is in a room THEN the system SHALL CONTINUE TO hide the "Start Game" button from them

3.3 WHEN multiple players join a room THEN the system SHALL CONTINUE TO correctly identify and display the host's username

---

### Bug 2: Room Persistence - Room Disappears When Host Leaves

#### Current Behavior (Defect)

1.4 WHEN the host leaves a room that has other players THEN the system deletes the entire room

1.5 WHEN the host disconnects from a room THEN all remaining players are kicked out and lose their game progress

1.6 WHEN a room is deleted due to host leaving THEN no host reassignment occurs for remaining players

#### Expected Behavior (Correct)

2.4 WHEN the host leaves a room that has other players THEN the system SHALL reassign the host role to the next available player

2.5 WHEN the host disconnects from a room THEN the system SHALL promote another player to host and the game SHALL continue

2.6 WHEN the last player leaves a room THEN the system SHALL delete the room and clean up resources

2.7 WHEN a new host is assigned THEN the system SHALL notify all remaining players with updated room information including the new host's username

#### Unchanged Behavior (Regression Prevention)

3.4 WHEN a non-host player leaves a room THEN the system SHALL CONTINUE TO remove only that player without affecting the room or other players

3.5 WHEN a room becomes empty THEN the system SHALL CONTINUE TO delete the room and clean up timers

3.6 WHEN players join and leave during gameplay THEN the system SHALL CONTINUE TO update the scoreboard correctly

---

### Bug 3: Profile Photo Display - Avatar Images Not Showing

#### Current Behavior (Defect)

1.7 WHEN a player's avatar is displayed in the scoreboard THEN the system shows a broken image or placeholder instead of the actual uploaded avatar

1.8 WHEN the avatar path is stored in the database as a relative path THEN the frontend cannot resolve the full URL to display the image

1.9 WHEN a user uploads an avatar THEN the system stores the path without the backend server URL prefix

#### Expected Behavior (Correct)

2.8 WHEN a player's avatar is displayed in the scoreboard THEN the system SHALL show the actual uploaded avatar image or a generated UI avatar as fallback

2.9 WHEN the avatar path is retrieved from the database THEN the system SHALL construct the full URL using the backend server URL

2.10 WHEN a user has an uploaded avatar THEN the system SHALL serve the image from the `/uploads` static directory with proper CORS headers

2.11 WHEN a user has no avatar THEN the system SHALL display a generated avatar using ui-avatars.com with the user's username

#### Unchanged Behavior (Regression Prevention)

3.7 WHEN a user uploads a new avatar THEN the system SHALL CONTINUE TO save the file to the uploads directory

3.8 WHEN avatar images are requested THEN the system SHALL CONTINUE TO serve them as static files from the backend

3.9 WHEN a player joins a game THEN the system SHALL CONTINUE TO include their avatar information in the player data

---

### Bug 4: Genre and Difficulty Selection - Configuration Not Applied

#### Current Behavior (Defect)

1.10 WHEN a user selects a genre during room creation THEN the selected genre is not properly passed to the music service

1.11 WHEN a user selects a difficulty level during room creation THEN the difficulty setting has no effect on gameplay

1.12 WHEN the game starts THEN the system always uses default genre settings regardless of room configuration

#### Expected Behavior (Correct)

2.12 WHEN a user selects a genre during room creation THEN the system SHALL store the genre in the room configuration

2.13 WHEN the game starts THEN the system SHALL fetch tracks matching the selected genre from the music service

2.14 WHEN a user selects a difficulty level THEN the system SHALL apply difficulty-specific settings (round duration, hint availability, scoring multipliers)

2.15 WHEN tracks are fetched for a room THEN the system SHALL use the room's genre setting to query the iTunes API

#### Unchanged Behavior (Regression Prevention)

3.10 WHEN the iTunes API is unavailable THEN the system SHALL CONTINUE TO fall back to demo tracks

3.11 WHEN a room is created without specifying genre THEN the system SHALL CONTINUE TO default to "Pop Indo"

3.12 WHEN tracks are fetched THEN the system SHALL CONTINUE TO filter for valid tracks with preview URLs

---

## Bug Condition Derivation

### Bug 1: Room Creation/Joining Bug Condition

```pascal
FUNCTION isBugCondition1(X)
  INPUT: X of type RoomJoinEvent
  OUTPUT: boolean
  
  // Bug occurs when the room creator joins their own room
  RETURN X.userId = X.room.hostId AND X.room.host != X.username
END FUNCTION
```

**Property: Fix Checking - Host Recognition**
```pascal
FOR ALL X WHERE isBugCondition1(X) DO
  result ← handleRoomJoin'(X)
  ASSERT result.isHost = true AND 
         result.statusMessage = "You are the Host. Click Start Game when ready." AND
         result.showStartButton = true
END FOR
```

---

### Bug 2: Room Persistence Bug Condition

```pascal
FUNCTION isBugCondition2(X)
  INPUT: X of type PlayerLeaveEvent
  OUTPUT: boolean
  
  // Bug occurs when host leaves but room still has other players
  RETURN X.player.isHost = true AND X.room.players.length > 1
END FUNCTION
```

**Property: Fix Checking - Host Reassignment**
```pascal
FOR ALL X WHERE isBugCondition2(X) DO
  result ← handlePlayerLeave'(X)
  ASSERT result.room.exists = true AND
         result.room.host = result.room.players[0].username AND
         result.room.hostId = result.room.players[0].userId AND
         result.notificationSent = true
END FOR
```

**Preservation Goal:**
```pascal
// Property: Preservation Checking
FOR ALL X WHERE NOT isBugCondition2(X) DO
  ASSERT handlePlayerLeave(X) = handlePlayerLeave'(X)
END FOR
```

---

### Bug 3: Profile Photo Bug Condition

```pascal
FUNCTION isBugCondition3(X)
  INPUT: X of type PlayerAvatarData
  OUTPUT: boolean
  
  // Bug occurs when avatar path is relative and not a full URL
  RETURN X.avatar != null AND 
         X.avatar != "" AND 
         NOT X.avatar.startsWith("http")
END FUNCTION
```

**Property: Fix Checking - Avatar URL Construction**
```pascal
FOR ALL X WHERE isBugCondition3(X) DO
  result ← constructAvatarUrl'(X)
  ASSERT result.startsWith("http") AND
         result.includes("/uploads/avatars/") AND
         imageAccessible(result) = true
END FOR
```

**Preservation Goal:**
```pascal
// Property: Preservation Checking
FOR ALL X WHERE NOT isBugCondition3(X) DO
  ASSERT constructAvatarUrl(X) = constructAvatarUrl'(X)
END FOR
```

---

### Bug 4: Genre and Difficulty Selection Bug Condition

```pascal
FUNCTION isBugCondition4(X)
  INPUT: X of type GameStartEvent
  OUTPUT: boolean
  
  // Bug occurs when room has a specific genre but default tracks are fetched
  RETURN X.room.genre != "All" AND 
         X.room.genre != null AND
         X.fetchedTracks.genre != X.room.genre
END FUNCTION
```

**Property: Fix Checking - Genre Application**
```pascal
FOR ALL X WHERE isBugCondition4(X) DO
  result ← fetchTracksForGame'(X)
  ASSERT result.tracks.genre = X.room.genre AND
         result.tracks.length > 0 AND
         result.difficultyApplied = true
END FOR
```

**Preservation Goal:**
```pascal
// Property: Preservation Checking
FOR ALL X WHERE NOT isBugCondition4(X) DO
  ASSERT fetchTracksForGame(X) = fetchTracksForGame'(X)
END FOR
```

---

## Root Cause Analysis

### Bug 1 Root Cause
The host identification logic in `gameController.js` compares `room.host` (username string) with `socket.user?.username`, but when the room is first created, the host is set using the username from the REST API, while the socket connection may have a different username format or timing issue. The comparison fails because the identity matching is inconsistent between REST and WebSocket contexts.

### Bug 2 Root Cause
The `handlePlayerLeave` function in `gameController.js` deletes the room immediately when the host leaves, without checking if other players remain. The host reassignment logic exists but is placed after the room deletion check, making it unreachable when the host leaves.

### Bug 3 Root Cause
Avatar paths are stored as relative paths (e.g., `/uploads/avatars/avatar_123.png`) in the database, but the frontend doesn't construct the full URL by prepending the backend server URL. The ScoreBoard component uses the avatar value directly without URL construction, causing broken image links.

### Bug 4 Root Cause
The `fetchTracksByGenre` function is called with `room.genre`, but the room's genre property is correctly set. However, the difficulty setting is stored but never used to modify game parameters like round duration, scoring, or hint availability. The genre selection works but difficulty has no implementation.

---

## Counterexamples

### Bug 1 Counterexample
```javascript
// User creates room via REST API
POST /api/rooms { name: "My Room", genre: "K-Pop" }
// Response: { id: "room_123", host: "Alice" }

// User joins via Socket.io
socket.emit('join-room', { roomId: "room_123", token: "jwt_token" })
// Expected: "You are the Host. Click Start Game when ready."
// Actual: "Connected to room. Waiting for host to start."
```

### Bug 2 Counterexample
```javascript
// Room has 3 players: Alice (host), Bob, Charlie
// Alice disconnects
socket.disconnect()
// Expected: Bob becomes host, room persists with Bob and Charlie
// Actual: Room deleted, Bob and Charlie kicked out
```

### Bug 3 Counterexample
```javascript
// Player data in scoreboard
{
  username: "Alice",
  avatar: "/uploads/avatars/avatar_usr_123.png",
  score: 850
}
// Expected: Image loads from http://localhost:3000/uploads/avatars/avatar_usr_123.png
// Actual: Browser tries to load from http://localhost:5173/uploads/avatars/avatar_usr_123.png (404)
```

### Bug 4 Counterexample
```javascript
// Room created with genre "Rock" and difficulty "Hard"
createRoom({ genre: "Rock", difficulty: "Hard" })
// Expected: Fetches rock tracks, applies hard difficulty settings
// Actual: Fetches rock tracks correctly, but difficulty has no effect on gameplay
```
