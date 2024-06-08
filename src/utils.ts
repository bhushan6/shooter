import * as THREE from "three";
import { RigidBody } from "@dimforge/rapier3d-compat";
import { RigidBodyState } from "@react-three/rapier/dist/declarations/src/components/Physics";
import { _scale } from "./constant";


function lookAtY(): (
  mesh: THREE.Mesh | THREE.Group,
  targetVector: THREE.Vector3
) => void {
  const meshPosition = new THREE.Vector3();
  const direction = new THREE.Vector3();

  return (mesh: THREE.Mesh | THREE.Group, targetVector: THREE.Vector3) => {
    mesh.getWorldPosition(meshPosition);
    direction.subVectors(targetVector, meshPosition);
    direction.y = 0;
    direction.normalize();
    const angle = Math.atan2(direction.x, direction.z);
    mesh.rotation.y = Math.PI + angle;
  };
}

export const lookAt = lookAtY();

interface CreateRigidBodyStateOptions {
  object: THREE.Object3D;
  rigidBody: RigidBody;
  setMatrix?: (matrix: THREE.Matrix4) => void;
  getMatrix?: (matrix: THREE.Matrix4) => THREE.Matrix4;
  worldScale?: THREE.Vector3;
  meshType?: RigidBodyState["meshType"];
}

export const createRigidBodyState = ({
  rigidBody,
  object,
  setMatrix,
  getMatrix,
  worldScale,
  meshType = "mesh",
}: CreateRigidBodyStateOptions): RigidBodyState => {
  object.updateWorldMatrix(true, false);
  const invertedWorldMatrix = object.parent!.matrixWorld.clone().invert();

  return {
    object,
    rigidBody,
    invertedWorldMatrix,
    setMatrix: setMatrix
      ? setMatrix
      : (matrix: THREE.Matrix4) => {
          object.matrix.copy(matrix);
        },
    getMatrix: getMatrix
      ? getMatrix
      : (matrix: THREE.Matrix4) => matrix.copy(object.matrix),
    scale: worldScale || object.getWorldScale(_scale).clone(),
    isSleeping: false,
    meshType,
  };
};