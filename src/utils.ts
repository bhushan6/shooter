import * as THREE from "three";

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
