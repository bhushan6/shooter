import "./App.css";
import { Canvas } from "@react-three/fiber";
import { Suspense, useState } from "react";
import { Physics } from "@react-three/rapier";
import { Ground, Lights, Player } from "./components";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

const Experience = () => {
  const [navMesh, setNavMesh] = useState<THREE.Mesh>();
  return (
    <>
      <Ground setNavMesh={setNavMesh} rotation={[-Math.PI / 2, 0, 0]} />
      {navMesh && <Player navMesh={navMesh} position={[0, 1.5, 0]} />}
    </>
  );
};

function App() {
  return (
    <div style={{ height: "100vh" }}>
      <Suspense>
        <Canvas camera={{ position: [0, 30, 35] }} shadows>
          <color attach="background" args={["black"]} />
          <Physics gravity={[0, -9.81, 0]} debug>
            <Experience />
          </Physics>
          <Lights />
          <OrbitControls />
        </Canvas>
      </Suspense>
    </div>
  );
}

export default App;
