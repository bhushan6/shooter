import { useFrame, useThree } from "@react-three/fiber";
import { useRapier } from "@react-three/rapier";
import { useMemo } from "react";
import { Enemies } from "../components/Enemies";

export const useEnemies = () => {
  const { scene } = useThree();

  const RAPIER = useRapier();

  const enemies = useMemo(() => {
    return new Enemies(scene, RAPIER);
  }, [scene, RAPIER]);

  useFrame(() => {
    enemies.update();
  });

  return enemies;
};
