# 🎮 Bounce Catch

A retro-neon arcade game built with pure HTML, CSS, and JavaScript — no frameworks, no dependencies. Catch the bouncing ball with your slider before it hits the ground. Survive all 3 laps and post the highest score you can.

---

## 🕹️ Gameplay

- A ball bounces around the screen.
- Drag the **glowing slider** left and right to catch it
- Miss the ball → the lap ends
- Complete all **3 laps** to finish the game
- Each successful catch earns **+10 pts**, multiplied by your current streak
- The ball gets **faster** each lap and with every consecutive catch

---

## ✨ Features

- Realistic ball physics — angle of bounce depends on where it hits the slider
- Streak multiplier system (×1 up to ×10)
- Particle burst effects on every catch and wall collision
- Ball trail and dynamic color shift per catch
- Neon glow UI with scanline grid overlay
- Danger zone flash when the ball hits the ground
- Full score breakdown per lap on the results screen
- **Mobile-first** — touch drag and tap-to-snap slider controls

---

## 📱 Mobile Support

The game is designed primarily for mobile screens. Controls use touch events with a generous hit area around the slider. Tapping anywhere on the canvas snaps the slider to that position instantly.

---

## 🎨 Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Markup     | HTML5                             |
| Styling    | CSS3 |
| Logic      | JavaScript (ES6+)         |
| Rendering  | HTML5 Canvas 2D API               |
| Fonts      | Google Fonts — Orbitron, Space Mono |

---

## 🗂️ Game Screens

| Screen       | Description                                              |
|--------------|----------------------------------------------------------|
| Start        | Landing screen with a single **START** button            |
| Playing      | Live game with HUD showing score, lap, and streak        |
| Lap End      | Summary after each missed ball with a continue prompt    |
| Game Over    | Final score with per-lap breakdown, **PLAY AGAIN** and **HOME** options |

---

## 📜 Author

- This project is created by **Muhammad Mutahhar Khan**.
- LinkedIn: https://www.linkedin.com/in/muhammad-mutahhar-khan-562070378/
