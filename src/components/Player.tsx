import { ThreeElements, useFrame } from "@react-three/fiber";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  CapsuleCollider,
  RapierRigidBody,
  RigidBody,
} from "@react-three/rapier";
import * as THREE from "three";
import { useMovementControls } from "../hooks/useMovementControls";
import { lookAt } from "../utils";
import {
  GROUND_SIZE,
  MOVE_SPEED,
  direction,
  frontVector,
  sideVector,
} from "../constant";
import { Pathfinding } from "three-pathfinding";
import { useBullets } from "../hooks/useBullets";
import { useEnemies } from "../hooks/useEnemies";

const BULLET_FIRE_INTERVAL = 200;

interface GunMethods {
  muzzleRef: React.RefObject<THREE.Group<THREE.Object3DEventMap>>;
}

const Gun = forwardRef<GunMethods, {}>((_, ref) => {
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

const pathfinding = new Pathfinding();
const ZONE = "level1";

export const Player = (
  props: ThreeElements["mesh"] & { navMesh: THREE.Mesh }
) => {
  const playerRef = useRef<RapierRigidBody>(null);
  const playerMeshRef = useRef<THREE.Group>(null);

  const gunRef = useRef<GunMethods>(null);

  const bullets = useBullets();

  const enemies = useEnemies();

  const lastTimeFired = useRef(0);

  useEffect(() => {
    if (!playerRef.current || !playerMeshRef.current) return;

    pathfinding.setZoneData(
      ZONE,
      Pathfinding.createZone(props.navMesh.geometry)
    );
  }, []);

  const [path, setPath] = useState<THREE.Vector3[]>([]);

  // const lookAtRef = useRef<THREE.Mesh>(null);

  const { moveForward, moveBackward, moveLeft, moveRight } =
    useMovementControls();

  useFrame(() => {
    if (!playerRef.current || !playerMeshRef.current) return;

    const velocity = playerRef.current.linvel();

    frontVector.set(0, 0, Number(moveBackward) - Number(moveForward));
    sideVector.set(Number(moveLeft) - Number(moveRight), 0, 0);
    direction
      .subVectors(frontVector, sideVector)
      .normalize()
      .multiplyScalar(MOVE_SPEED)
      .applyEuler(playerMeshRef.current.rotation);

    playerRef.current.setLinvel(
      {
        x: direction.x,
        y: velocity.y,
        z: direction.z,
      },
      true
    );
  });

  return (
    <>
      <RigidBody
        colliders={false}
        ref={playerRef}
        enabledRotations={[false, false, false]}
      >
        <CapsuleCollider position={props.position} args={[1, 0.75]} />
        <group ref={playerMeshRef}>
          <mesh {...props} castShadow>
            <capsuleGeometry attach="geometry" args={[1, 1.5, 32, 32]} />
            <meshStandardMaterial attach="material" color="red" />
          </mesh>
          <mesh position={[0, 1.5, -1.6]} rotation={[-Math.PI / 2, 0, 0]}>
            <coneGeometry attach="geometry" args={[0.2, 0.5, 32, 32]} />
            <meshStandardMaterial attach="material" color="red" />
          </mesh>
          <Gun ref={gunRef} />
        </group>
      </RigidBody>

      {/* <mesh ref={lookAtRef}>
        <sphereGeometry attach="geometry" args={[0.5, 16, 16]} />
        <meshStandardMaterial attach="material" color="red" />
      </mesh> */}

      <mesh
        {...props}
        receiveShadow
        visible={false}
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerMove={(e) => {
          if (!playerMeshRef.current) return;

          lookAt(playerMeshRef.current, e.point);

          // lookAtRef.current?.position.set(
          //   e.point.x,
          //   e.point.y,
          //   e.point.z
          // );
        }}
        // onClick={(e) => {
        //   const a = new THREE.Vector3(0, 0, 0);
        //   const b = new THREE.Vector3(e.point.x, 0, e.point.z);

        //   const groupID = pathfinding.getGroup(ZONE, a);
        //   const path = pathfinding.findPath(a, b, ZONE, groupID);
        //   path && setPath(path);
        //   console.log(path);
        // }}
        onPointerDown={() => {
          const muzzle = gunRef.current?.muzzleRef.current;
          if (!muzzle || !playerMeshRef.current) return;
          if (Date.now() - lastTimeFired.current < BULLET_FIRE_INTERVAL) return;
          lastTimeFired.current = Date.now();
          const newBullet = {
            id: Date.now(),
            position: muzzle.getWorldPosition(new THREE.Vector3()),
            direction: playerMeshRef.current
              .getWorldDirection(new THREE.Vector3())
              .clone()
              .negate(),
          };

          enemies.addEnemy({
            id: Date.now(),
            position: new THREE.Vector3(
              (0.5 - Math.random()) * 20,
              1.5,
              (0.5 - Math.random()) * 20
            ),
          });

          bullets.addBullet(newBullet);
        }}
      >
        <planeGeometry attach="geometry" args={[GROUND_SIZE, GROUND_SIZE]} />
      </mesh>

      <>
        {path.map((p, i) => {
          return (
            <mesh position={p} key={i}>
              <sphereGeometry />
            </mesh>
          );
        })}
      </>
    </>
  );
};
