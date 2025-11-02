"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw } from "lucide-react";

interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Dinosaur extends GameObject {
  velocityY: number;
  isJumping: boolean;
  isDucking: boolean;
}

interface Obstacle extends GameObject {
  velocityX: number;
}

export function DinosaurGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number>(0);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameState, setGameState] = useState<
    "waiting" | "playing" | "gameOver"
  >("waiting");
  const [gameSpeed, setGameSpeed] = useState(6);

  // Game objects
  const dinosaurRef = useRef<Dinosaur>({
    x: 50,
    y: 150,
    width: 40,
    height: 40,
    velocityY: 0,
    isJumping: false,
    isDucking: false,
  });

  const obstaclesRef = useRef<Obstacle[]>([]);
  const groundRef = useRef({ x: 0, y: 200, width: 800, height: 20 });

  // Game constants
  const GRAVITY = 0.8;
  const JUMP_FORCE = -15;
  const GROUND_Y = 150;
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 220;

  // Initialize high score from localStorage
  useEffect(() => {
    const savedHighScore = localStorage.getItem("dino-high-score");
    if (savedHighScore) {
      setHighScore(Number.parseInt(savedHighScore));
    }
  }, []);

  // Draw functions
  const drawDinosaur = useCallback(
    (ctx: CanvasRenderingContext2D, dino: Dinosaur) => {
      ctx.fillStyle = "#535353";

      if (dino.isDucking) {
        // Draw ducking dinosaur (rectangle)
        ctx.fillRect(dino.x, dino.y + 20, dino.width, dino.height - 20);
      } else {
        // Draw standing dinosaur
        ctx.fillRect(dino.x, dino.y, dino.width, dino.height);

        // Simple dinosaur shape
        ctx.fillRect(dino.x + 35, dino.y - 10, 10, 15); // neck
        ctx.fillRect(dino.x + 40, dino.y - 20, 15, 15); // head
        ctx.fillRect(dino.x + 5, dino.y + 35, 8, 15); // leg 1
        ctx.fillRect(dino.x + 25, dino.y + 35, 8, 15); // leg 2
      }
    },
    []
  );

  const drawObstacle = useCallback(
    (ctx: CanvasRenderingContext2D, obstacle: Obstacle) => {
      ctx.fillStyle = "#535353";

      // Draw cactus-like obstacle
      ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);

      // Add some cactus details
      if (obstacle.width > 15) {
        ctx.fillRect(obstacle.x + 5, obstacle.y - 10, 8, 15); // arm
        ctx.fillRect(obstacle.x + obstacle.width - 13, obstacle.y - 8, 8, 12); // arm
      }
    },
    []
  );

  const drawGround = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = "#535353";
    ctx.fillRect(0, GROUND_Y + 40, CANVAS_WIDTH, 2);

    // Moving ground pattern
    ctx.strokeStyle = "#535353";
    ctx.lineWidth = 1;
    for (let i = groundRef.current.x % 20; i < CANVAS_WIDTH; i += 20) {
      ctx.beginPath();
      ctx.moveTo(i, GROUND_Y + 45);
      ctx.lineTo(i + 10, GROUND_Y + 45);
      ctx.stroke();
    }
  }, []);

  const drawScore = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      currentScore: number,
      highScore: number
    ) => {
      ctx.fillStyle = "#535353";
      ctx.font = "16px monospace";
      ctx.textAlign = "right";
      ctx.fillText(
        `HI ${highScore.toString().padStart(5, "0")} ${currentScore
          .toString()
          .padStart(5, "0")}`,
        CANVAS_WIDTH - 20,
        30
      );
    },
    []
  );

  const drawGameOver = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = "#535353";
    ctx.font = "bold 24px monospace";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);

    ctx.font = "14px monospace";
    ctx.fillText(
      "Press SPACE or CLICK to restart",
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT / 2 + 10
    );
  }, []);

  // Collision detection
  const checkCollision = useCallback(
    (dino: Dinosaur, obstacle: Obstacle): boolean => {
      return (
        dino.x < obstacle.x + obstacle.width &&
        dino.x + dino.width > obstacle.x &&
        dino.y < obstacle.y + obstacle.height &&
        dino.y + dino.height > obstacle.y
      );
    },
    []
  );

  // Game logic
  const jump = useCallback(() => {
    const dino = dinosaurRef.current;
    if (!dino.isJumping && gameState === "playing") {
      dino.velocityY = JUMP_FORCE;
      dino.isJumping = true;
    }
  }, [gameState]);

  const duck = useCallback(
    (isDucking: boolean) => {
      if (gameState === "playing") {
        dinosaurRef.current.isDucking = isDucking;
      }
    },
    [gameState]
  );

  const spawnObstacle = useCallback(() => {
    if (gameState !== "playing") return;

    const obstacles = obstaclesRef.current;
    const lastObstacle = obstacles[obstacles.length - 1];

    if (
      !lastObstacle ||
      lastObstacle.x < CANVAS_WIDTH - 200 - Math.random() * 200
    ) {
      const obstacleTypes = [
        { width: 15, height: 35 },
        { width: 25, height: 45 },
        { width: 35, height: 25 },
      ];

      const type =
        obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];

      obstacles.push({
        x: CANVAS_WIDTH,
        y: GROUND_Y + 40 - type.height,
        width: type.width,
        height: type.height,
        velocityX: -gameSpeed,
      });
    }
  }, [gameSpeed, gameState]);

  const updateGame = useCallback(() => {
    if (gameState !== "playing") return;

    const dino = dinosaurRef.current;
    const obstacles = obstaclesRef.current;

    // Update dinosaur physics
    if (dino.isJumping) {
      dino.velocityY += GRAVITY;
      dino.y += dino.velocityY;

      if (dino.y >= GROUND_Y) {
        dino.y = GROUND_Y;
        dino.velocityY = 0;
        dino.isJumping = false;
      }
    }

    // Update obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
      const obstacle = obstacles[i];
      obstacle.x += obstacle.velocityX;

      // Remove off-screen obstacles
      if (obstacle.x + obstacle.width < 0) {
        obstacles.splice(i, 1);
        setScore((prev) => prev + 10);
      }

      // Check collision
      if (checkCollision(dino, obstacle)) {
        setGameState("gameOver");
        const newHighScore = Math.max(score, highScore);
        setHighScore(newHighScore);
        localStorage.setItem("dino-high-score", newHighScore.toString());
        return;
      }
    }

    // Spawn new obstacles
    spawnObstacle();

    // Update ground
    groundRef.current.x -= gameSpeed;
    if (groundRef.current.x <= -20) {
      groundRef.current.x = 0;
    }

    // Increase game speed gradually
    setGameSpeed((prev) => Math.min(prev + 0.001, 12));
  }, [gameState, score, highScore, checkCollision, spawnObstacle]);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw game elements
    drawGround(ctx);
    drawDinosaur(ctx, dinosaurRef.current);

    obstaclesRef.current.forEach((obstacle) => {
      drawObstacle(ctx, obstacle);
    });

    drawScore(ctx, score, highScore);

    if (gameState === "gameOver") {
      drawGameOver(ctx);
    } else if (gameState === "waiting") {
      ctx.fillStyle = "#535353";
      ctx.font = "16px monospace";
      ctx.textAlign = "center";
      ctx.fillText(
        "Press SPACE or CLICK to start",
        CANVAS_WIDTH / 2,
        CANVAS_HEIGHT / 2
      );
    }
  }, [
    score,
    highScore,
    gameState,
    drawGround,
    drawDinosaur,
    drawObstacle,
    drawScore,
    drawGameOver,
  ]);

  const gameLoop = useCallback(() => {
    updateGame();
    render();
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [updateGame, render]);

  const startGame = useCallback(() => {
    setGameState("playing");
    setScore(0);
    setGameSpeed(6);
    dinosaurRef.current = {
      x: 50,
      y: GROUND_Y,
      width: 40,
      height: 40,
      velocityY: 0,
      isJumping: false,
      isDucking: false,
    };
    obstaclesRef.current = [];
  }, []);

  const resetGame = useCallback(() => {
    setGameState("waiting");
    setScore(0);
    setGameSpeed(6);
    dinosaurRef.current = {
      x: 50,
      y: GROUND_Y,
      width: 40,
      height: 40,
      velocityY: 0,
      isJumping: false,
      isDucking: false,
    };
    obstaclesRef.current = [];
  }, []);

  // Event handlers
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        if (gameState === "waiting" || gameState === "gameOver") {
          startGame();
        } else if (gameState === "playing") {
          jump();
        }
      }

      if (e.code === "ArrowDown") {
        e.preventDefault();
        duck(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "ArrowDown") {
        e.preventDefault();
        duck(false);
      }
    };

    const handleClick = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (gameState === "waiting" || gameState === "gameOver") {
        startGame();
      } else if (gameState === "playing") {
        jump();
      }
    };

    const canvas = canvasRef.current;

    window.addEventListener("keydown", handleKeyPress);
    window.addEventListener("keyup", handleKeyUp);

    if (canvas) {
      canvas.addEventListener("click", handleClick);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
      window.removeEventListener("keyup", handleKeyUp);

      if (canvas) {
        canvas.removeEventListener("click", handleClick);
      }
    };
  }, [gameState, startGame, jump, duck]);

  // Game loop
  useEffect(() => {
    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameLoop]);

  return (
    <div className="flex flex-col items-center space-y-4">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-100 cursor-pointer max-w-full"
        style={{ imageRendering: "pixelated" }}
      />

      <div className="flex gap-2">
        {gameState === "waiting" && (
          <Button onClick={startGame} size="sm">
            <Play className="w-4 h-4 mr-2" />
            Start Game
          </Button>
        )}

        {gameState === "playing" && (
          <Button
            onClick={() => setGameState("waiting")}
            variant="outline"
            size="sm"
          >
            <Pause className="w-4 h-4 mr-2" />
            Pause
          </Button>
        )}

        <Button onClick={resetGame} variant="outline" size="sm">
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
      </div>

      <div className="text-center text-sm text-gray-600 dark:text-gray-400">
        <p>
          Score: <span className="font-mono font-bold">{score}</span>
        </p>
        <p>
          High Score: <span className="font-mono font-bold">{highScore}</span>
        </p>
      </div>
    </div>
  );
}
