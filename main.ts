namespace raycasting3d {
    export interface MapTile {
        wallHeight: number; // height of wall (0 means no wall)
        floorHeight: number; // floor height at tile
        ceilingHeight: number; // ceiling height at tile
        stairHeight?: number; // optional stairs height change (+/-)
    }

    // Example map 2D grid of tiles
    export let map: MapTile[][] = [];

    // Player position and orientation
    export let playerX = 1.5;
    export let playerY = 1.5;
    export let playerHeight = 0; // vertical offset (stairs)
    export let playerAngle = 0;

    // Map size
    export let mapWidth = 0;
    export let mapHeight = 0;

    // Initialize map with size and tiles
    export function setMap(newMap: MapTile[][]) {
        map = newMap;
        mapWidth = map.length;
        mapHeight = map[0].length;
    }

    // Set player position and angle
    export function setPlayer(x: number, y: number, height: number, angle: number) {
        playerX = x;
        playerY = y;
        playerHeight = height;
        playerAngle = angle;
    }

    // Simple rendering function for raycasting (draws vertical slices)
    export function render(scene: Image) {
        const screenWidth = scene.width;
        const screenHeight = scene.height;

        scene.fill(0); // clear screen black

        // FOV and number of rays
        const FOV = Math.PI / 3;
        const numRays = screenWidth;

        for (let i = 0; i < numRays; i++) {
            const rayAngle = playerAngle - FOV / 2 + (i / numRays) * FOV;

            // Cast ray until hit wall
            let rayX = playerX;
            let rayY = playerY;
            let rayStep = 0.05;
            let distance = 0;
            let hit = false;
            let hitTile: MapTile | null = null;

            while (!hit && distance < 20) {
                rayX += rayStep * Math.cos(rayAngle);
                rayY += rayStep * Math.sin(rayAngle);
                distance += rayStep;

                const mapX = Math.floor(rayX);
                const mapY = Math.floor(rayY);

                if (mapX < 0 || mapX >= mapWidth || mapY < 0 || mapY >= mapHeight) {
                    break; // out of bounds
                }

                const tile = map[mapX][mapY];
                if (tile.wallHeight > 0) {
                    hit = true;
                    hitTile = tile;
                }
            }

            if (hit && hitTile) {
                // Calculate wall slice height based on distance and wall height
                const wallHeightPx = Math.min(screenHeight, (screenHeight / distance) * hitTile.wallHeight * 2);

                // Calculate floor and ceiling positions on screen considering player height and tile floor/ceiling heights
                const floorHeightPx = (screenHeight / 2) + (playerHeight - hitTile.floorHeight) * 10;
                const ceilingHeightPx = (screenHeight / 2) - (hitTile.ceilingHeight - playerHeight) * 10;

                // Draw wall slice as vertical line
                const wallTop = Math.max(0, ceilingHeightPx);
                const wallBottom = Math.min(screenHeight, floorHeightPx);

                for (let y = 0; y < screenHeight; y++) {
                    if (y >= wallTop && y <= wallBottom) {
                        scene.setPixel(i, y, 15); // white wall pixel
                    } else if (y > wallBottom) {
                        scene.setPixel(i, y, 3); // floor pixel (dark gray)
                    } else {
                        scene.setPixel(i, y, 1); // ceiling pixel (light gray)
                    }
                }
            } else {
                // No wall hit, fill ceiling and floor colors
                for (let y = 0; y < screenHeight; y++) {
                    if (y > screenHeight / 2) {
                        scene.setPixel(i, y, 3); // floor
                    } else {
                        scene.setPixel(i, y, 1); // ceiling
                    }
                }
            }
        }
    }
}
