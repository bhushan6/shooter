import { ThreeElements, useThree } from "@react-three/fiber";
import { RigidBody } from "@react-three/rapier";
import * as THREE from "three";
import { GROUND_SIZE } from "../constant";
import { useEffect, useRef } from "react";

function createPlaneShapeFromMesh(mesh: THREE.Mesh, offset=2): THREE.Shape {
  // Compute the bounding box of the mesh
  const boundingBox = new THREE.Box3().setFromObject(mesh);

  // Get the size of the bounding box
  const size = new THREE.Vector3();
  boundingBox.getSize(size);

  // Get the center of the bounding box
  const center = new THREE.Vector3();
  boundingBox.getCenter(center);

  // Adjust for the mesh's position
  const position = mesh.position;

  size.x += offset;
  size.z += offset;

  // Create the plane shape based on the bounding box size and position
  const planeShape = new THREE.Shape();
  planeShape.moveTo(
    (position.x + center.x - size.x) / 2,
    (position.z + center.z - size.z) / 2
  );
  planeShape.lineTo(
    (position.x + center.x + size.x) / 2,
    (position.z + center.z - size.z) / 2
  );
  planeShape.lineTo(
    (position.x + center.x + size.x) / 2,
    (position.z + center.z + size.z) / 2
  );
  planeShape.lineTo(
    (position.x + center.x - size.x) / 2,
    (position.z + center.z + size.z) / 2
  );
  planeShape.lineTo(
    (position.x + center.x - size.x) / 2,
    (position.z + center.z - size.z) / 2
  );

  return planeShape;
}

export const Ground = (
  props: ThreeElements["mesh"] & {
    setNavMesh: React.Dispatch<
      React.SetStateAction<
        | THREE.Mesh<
            THREE.BufferGeometry<THREE.NormalBufferAttributes>,
            THREE.Material | THREE.Material[],
            THREE.Object3DEventMap
          >
        | undefined
      >
    >;
  }
) => {
  const groundMeshRef = useRef<THREE.Mesh>(null);
  const ob = useRef<THREE.Mesh>(null);
  const ob2 = useRef<THREE.Mesh>(null);

  const { scene } = useThree();

  useEffect(() => {
    if (!groundMeshRef.current || !ob.current || !ob2.current) return;
    const groundShape = createPlaneShapeFromMesh(groundMeshRef.current, 0);
    const extrudeSettings = {
      depth: 0.01,
    };

    const obSh = createPlaneShapeFromMesh(ob.current);
    const ob2sh = createPlaneShapeFromMesh(ob2.current);

    groundShape.holes = [obSh, ob2sh];

    const geometry = new THREE.ExtrudeGeometry(groundShape, extrudeSettings);

    geometry.rotateX(Math.PI / 2);

    const mesh = new THREE.Mesh(
      geometry,
      new THREE.MeshStandardMaterial({ color: "yellow" })
    );

    scene.add(mesh);

    mesh.material.wireframe = true

    props.setNavMesh(mesh);

    return () => {
      scene.remove(mesh);
    };
  }, []);

  return (
    <>
      <RigidBody shape="cuboid">
        <mesh {...props} ref={groundMeshRef} receiveShadow>
          <planeGeometry attach="geometry" args={[GROUND_SIZE, GROUND_SIZE]} />
          <meshStandardMaterial
            attach="material"
            color="#ffffff"
            side={THREE.DoubleSide}
          />
        </mesh>
      </RigidBody>
      <mesh ref={ob} position={[-10, 2.5, 10]} >
        <boxGeometry args={[5, 5, 15]} />
        <meshStandardMaterial color={"green"} />
      </mesh>
      <mesh ref={ob2} position={[2, 2.5, 10]}>
        <boxGeometry args={[15, 5, 5]} />
        <meshStandardMaterial color={"green"} />
      </mesh>
    </>
  );
};
