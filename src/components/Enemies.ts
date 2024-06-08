import { Collider, RigidBody } from "@dimforge/rapier3d-compat";
import { CollisionEnterPayload, RapierContext } from "@react-three/rapier";
import * as THREE from "three";
import { createRigidBodyState } from "../utils";
type EnemyProps = { position: THREE.Vector3; id: Number };

const PLAYER_SIZE = {
  height: 1.5,
  radius: 1,
};

class Enemy {
  private _scene: THREE.Scene;

  private _position: THREE.Vector3;

  public id: Number;

  private _health = 100;

  private _mesh: THREE.Object3D;

  private _physicalObject: { rigidBody: RigidBody; collider: Collider };

  public addDamage(damage: number) {
    this._health -= damage;
    if (this._health <= 0) {
      this.dispose();
    }
  }

  private _parentInstance: Enemies;

  private _RAPIER: RapierContext;

  constructor(
    parent: Enemies,
    { position, id }: EnemyProps,
    scene: THREE.Scene
  ) {
    this._scene = scene;
    this._position = position;
    this.id = id;
    this._parentInstance = parent;

    this._RAPIER = parent._RAPIER;

    this._mesh = this.createMesh(this._position);

    this._scene.add(this._mesh);

    this._physicalObject = this.createPhysicalObject(this._position);

    const state = createRigidBodyState({
      rigidBody: this._physicalObject.rigidBody,
      object: this._mesh,
    });

    this._RAPIER.rigidBodyStates.set(
      this._physicalObject.rigidBody.handle,
      state
    );

    this._RAPIER.rigidBodyEvents.set(this._physicalObject.rigidBody.handle, {
      onCollisionEnter: this.onCollisionEnter,
    });
  }

  private onCollisionEnter(payload: CollisionEnterPayload) {
    console.log(payload);

    //Add damage to enemy on bullet hit
  }

  private createMesh(position: THREE.Vector3) {
    const mainGroup = new THREE.Object3D();
    const capsuleGeometry = new THREE.CapsuleGeometry(
      PLAYER_SIZE.radius,
      PLAYER_SIZE.height,
      32,
      32
    );
    const capsuleMaterial = new THREE.MeshStandardMaterial({ color: "green" });
    const capsuleMesh = new THREE.Mesh(capsuleGeometry, capsuleMaterial);
    capsuleMesh.castShadow = true;

    mainGroup.add(capsuleMesh);

    const coneGeometry = new THREE.ConeGeometry(0.2, 0.5, 32, 32);
    const coneMaterial = new THREE.MeshStandardMaterial({ color: "green" });
    const coneMesh = new THREE.Mesh(coneGeometry, coneMaterial);
    coneMesh.position.set(0, 1.5, -1.6);

    mainGroup.add(coneMesh);

    mainGroup.position.copy(position);
    return mainGroup;
  }

  private createPhysicalObject(position: THREE.Vector3) {
    const RAPIER = this._RAPIER.rapier;
    const physics = this._RAPIER.world;
    const rigidBodyDesc = RAPIER.RigidBodyDesc.dynamic();
    rigidBodyDesc.setTranslation(position.x, position.y, position.z);
    const rigidBody = physics.createRigidBody(rigidBodyDesc);

    rigidBody.setEnabledRotations(false, false, false, true);

    const colliderDesc = RAPIER.ColliderDesc.capsule(
      PLAYER_SIZE.height / 2,
      PLAYER_SIZE.radius
    ).setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS);

    const collider = physics.createCollider(colliderDesc, rigidBody);

    return { rigidBody, collider };
  }

  public update() {}

  public dispose() {
    this.update = () => {};
    this._scene.remove(this._mesh);
    this._RAPIER.world.removeRigidBody(this._physicalObject.rigidBody);
    this._RAPIER.world.removeCollider(this._physicalObject.collider, false);
    this._RAPIER.rigidBodyEvents.delete(this._physicalObject.rigidBody.handle);
    // this._RAPIER.rigidBodyStates.delete(this._physicalObject.rigidBody.handle);
  }
}

export class Enemies {
  private _scene: THREE.Scene;

  private _enemies: Enemy[] = [];

  public _RAPIER: RapierContext;

  constructor(scene: THREE.Scene, RAPIER: RapierContext) {
    this._scene = scene;
    this._RAPIER = RAPIER;
  }

  public addEnemy(data: EnemyProps) {
    const newEnemy = new Enemy(this, data, this._scene);
    this._enemies.push(newEnemy);
  }

  public removeEnemy(id: Number) {
    this._enemies = this._enemies.filter((enemy) => {
      const should = enemy.id !== id;
      if (should) {
        enemy.dispose();
      }
      return should;
    });
  }

  public update() {
    this._enemies.forEach((enemy) => enemy.update());
  }

  public dispose() {}
}

// const positionVector = new THREE.Vector3();

// const moveToPoint = (
//   rigidBody: RigidBody,
//   targetPosition: THREE.Vector3,
//   speed: number
// ) => {
//   const currentPosition = rigidBody.translation();
//   const direction = targetPosition.sub(currentPosition).normalize();
//   const velocity = direction.multiplyScalar(speed);
//   rigidBody.setLinvel(velocity, true);
//   const position = rigidBody.translation();
//   const distance = position.sub(targetPosition).length();
//   requestAnimationFrame(() => moveToPoint(rigidBody, targetPosition, speed));
// };
