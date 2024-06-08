import { useFrame, useThree } from "@react-three/fiber";
import { useRapier } from "@react-three/rapier";
import { useMemo } from "react";
import { Bullets } from "../components/Bullets";

export const useBullets = () => {
  const RAPIER = useRapier();

  const { scene } = useThree();

  const bullets = useMemo(() => {
    return new Bullets(scene, RAPIER);
  }, [scene, RAPIER]);

  useFrame(() => {
    bullets.update();
  });

  return bullets;
};
