import { Environment, Lightformer } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

export const Lights = () => {
  const shadowCamera = useRef<THREE.OrthographicCamera>(null!);
  // useHelper(shadowCamera, THREE.CameraHelper);
  return (
    <>
      <ambientLight intensity={Math.PI / 2} />
      <directionalLight
        castShadow
        position={[50, 50, 50]}
        intensity={5}
        shadow-mapSize-height={2048}
        shadow-mapSize-width={2048}
      >
        <orthographicCamera
          ref={shadowCamera}
          attach="shadow-camera"
          left={-100}
          right={100}
          top={100}
          bottom={-100}
          near={1}
          far={150}
        />
      </directionalLight>
      <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
      <Environment>
        <Lightformer
          form="rect"
          intensity={4}
          position={[15, 10, 10]}
          scale={20}
        />
        <Lightformer
          intensity={2}
          position={[-10, 0, -20]}
          scale={[10, 100, 1]}
        />
      </Environment>
    </>
  );
};
