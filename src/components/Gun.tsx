import { forwardRef, useImperativeHandle, useRef } from "react";
import * as THREE from "three";

export interface GunMethods {
  muzzleRef: React.RefObject<THREE.Group<THREE.Object3DEventMap>>;
}

export const Gun = forwardRef<GunMethods, {}>((_, ref) => {
  const muzzleRef = useRef<THREE.Group>(null);

  useImperativeHandle<
    {
      muzzleRef: React.RefObject<THREE.Group<THREE.Object3DEventMap>>;
    },
    {
      muzzleRef: React.RefObject<THREE.Group<THREE.Object3DEventMap>>;
    }
  >(
    ref,
    () => {
      return {
        muzzleRef,
      };
    },
    []
  );

  return (
    <>
      <group>
        <mesh
          position={[1.5, 1.8, -0.5]}
          rotation={[-Math.PI / 2, 0, 0]}
          castShadow
        >
          <boxGeometry attach="geometry" args={[0.5, 3, 0.5]} />
          <meshStandardMaterial attach="material" color="black" />
        </mesh>
        <mesh position={[1.5, 1.5, 0.5]} castShadow>
          <boxGeometry attach="geometry" args={[0.3, 1, 0.3]} />
          <meshStandardMaterial attach="material" color="black" />
        </mesh>
        <group ref={muzzleRef} name="muzzle" position={[1.5, 1.75, -2]} />
        <mesh position={[1.5, 1.75, -2]}>
          <boxGeometry attach="geometry" args={[0.1, 0.1, 0.2]} />
          <meshStandardMaterial attach="material" color="red" />
        </mesh>
      </group>
    </>
  );
});
