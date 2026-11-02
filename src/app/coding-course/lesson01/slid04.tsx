"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import RobotGame, { RobotGameConfig } from "./RobotGame";

interface Slid02Props {
  onNext?: () => void;
}

export const Slid04 = ({ onNext }: Slid02Props) => {
  const config: RobotGameConfig = {
    GRID: 5,
    startRobot: { x: 0, y: 4 },
    applePos: { x: 4, y: 0 },
    obstacles: [{ x: 2, y: 2 }],
  };

  return (
    <div className="w-full mx-auto px-2 sm:px-4">
      <h2 className="text-base sm:text-lg mb-4"><span className="font-bold">wyzwanie 2</span>: Doprowadź robota do jabłka i podnieś je. Uważaj na ściany i przeszkody!</h2>
      <RobotGame config={config} />

      <div className="flex justify-end mt-6 sm:mt-8">
        <Button onClick={onNext}>Idź dalej!</Button>
      </div>
    </div>
  );
};
