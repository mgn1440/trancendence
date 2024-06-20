// src/Bracket.js

import { useRef, useEffect, useState } from "@/lib/dom";

let drawBorder = (ctx, player, pos) => {
  ctx.font = "16px Arial";
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  if (!player) {
    ctx.fillText("", pos.x, pos.y + 25);
  } else {
    ctx.fillText(player, pos.x, pos.y + 25);
  }
  ctx.strokeRect(pos.x - 50, pos.y, 100, 40); // 네모 테두리
};

const Bracket = (users) => {
  const drawBracket = (canvas, p_width) => {
    const ctx = canvas.getContext("2d");

    // Canvas 크기 설정
    canvas.width = p_width;
    canvas.height = 400;

    // 기본 스타일 설정
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;

    // 4명의 대진표 그리기
    // 플레이어 이름

    const basex = window.innerWidth / 2 - 350;
    const basey = -50;
    // 플레이어 위치
    const positions = [
      { x: basex + 50, y: basey + 350 },
      { x: basex + 250, y: basey + 350 },
      { x: basex + 450, y: basey + 350 },
      { x: basex + 650, y: basey + 350 },
      { x: basex + 150, y: basey + 200 },
      { x: basex + 550, y: basey + 200 },
      { x: basex + 350, y: basey + 80 },
    ];

    // 플레이어 이름 및 테두리 그리기
    for (let i = 0; i < 7; i++) {
      drawBorder(ctx, users.users[i], positions[i]);
    }

    // 대진표 선 그리기
    // 1차전 (Player 1 vs Player 2)
    ctx.textAlign = "center";
    ctx.beginPath();
    ctx.moveTo(basex + 50, basey + 350);
    ctx.lineTo(basex + 50, basey + 275);
    ctx.lineTo(basex + 250, basey + 275);
    ctx.lineTo(basex + 250, basey + 350);
    ctx.moveTo(basex + 150, basey + 275);
    ctx.lineTo(basex + 150, basey + 240);
    ctx.stroke();

    // 1차전 (Player 3 vs Player 4)
    ctx.beginPath();
    ctx.moveTo(basex + 450, basey + 350);
    ctx.lineTo(basex + 450, basey + 275);
    ctx.lineTo(basex + 650, basey + 275);
    ctx.lineTo(basex + 650, basey + 350);
    ctx.moveTo(basex + 550, basey + 275);
    ctx.lineTo(basex + 550, basey + 240);
    ctx.stroke();

    // 결승전
    ctx.beginPath();
    ctx.moveTo(basex + 150, basey + 200);
    ctx.lineTo(basex + 150, basey + 150);
    ctx.lineTo(basex + 550, basey + 150);
    ctx.lineTo(basex + 550, basey + 200);
    ctx.stroke();

    // 우승자 자리
    ctx.beginPath();
    ctx.moveTo(basex + 350, basey + 150);
    ctx.lineTo(basex + 350, basey + 120);
    ctx.stroke();
  };
  // useEffect(() => {
  //   const canvas = document.getElementById("Bracket");
  //   const handleResize = () => {
  //     drawBracket(canvas, window.innerWidth);
  //   };
  //   drawBracket(canvas, window.innerWidth);

  //   window.addEventListener("resize", handleResize);
  //   return () => {
  //     window.removeEventListener("resize", handleResize);
  //   };
  // }, []);
  useEffect(() => {
    const canvas = document.getElementById("Bracket");
    drawBracket(canvas, window.innerWidth);
  }, [users]);

  return <canvas id="Bracket"></canvas>;
};

export default Bracket;
