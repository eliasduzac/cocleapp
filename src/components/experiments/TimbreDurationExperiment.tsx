"use client";

import { useState } from "react";
import TimbreSpace3D from "./TimbreSpace3D";
import SubjectiveDuration from "./SubjectiveDuration";

export default function TimbreDurationExperiment() {
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0, z: 0 });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <TimbreSpace3D cursorPos={cursorPos} setCursorPos={setCursorPos} />
      <SubjectiveDuration />
    </div>
  );
}