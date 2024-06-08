import { Collider, RigidBody } from "@dimforge/rapier3d-compat";
import { CollisionEnterPayload, RapierContext } from "@react-three/rapier";
import * as THREE from "three";
import { BULLET_SIZE } from "../constant";
import { createRigidBodyState } from "../utils";

type BulletProps = {
  position: THREE.Vector3;
  direction: THREE.Vector3;
  id: Number;
};

class Bullet {
  private _position: THREE.Vector3;
  private _direction: THREE.Vector3;

  public id: Number;

  private _scene: THREE.Scene;

  private _mesh: THREE.Object3D;
  private _physicalObject: { rigidBody: RigidBody; collider: Collider };

  private _RAPIER: RapierContext;

  private directionVec: THREE.Vector3 = new THREE.Vector3();

  private _parentInstance: Bullets;

  constructor(
    parent: Bullets,
    { position, direction, id }: BulletProps,
    scene: THREE.Scene,
    RAPIER: RapierContext
  ) {
    this._position = position;
    this._direction = direction;
    this.id = id;

    this._scene = scene;

    this._RAPIER = RAPIER;

    this._mesh = this.createBulletMesh(this._position);
    this._scene.add(this._mesh);

    this._physicalObject = this.createBulletPhysicalObject(this._position);

    this._parentInstance = parent;

    const d = this._direction.clone().multiply(new THREE.Vector3(100, 1, 100));
    d.y = 1.75;
    this._mesh.lookAt(d);
    const q = new THREE.Quaternion();
    this._mesh.getWorldQuaternion(q);

    this._physicalObject.rigidBody.setRotation(
      { x: q.x, y: q.y, z: q.z, w: q.w },
      true
    );

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

    setTimeout(() => {
      this._parentInstance.removeBullet(this.id);
    }, 5000);
  }

  private createBulletMesh(position: THREE.Vector3) {
    const geometry = new THREE.BoxGeometry(
      BULLET_SIZE.width,
      BULLET_SIZE.height,
      BULLET_SIZE.depth
    );
    const material = new THREE.MeshStandardMaterial({ color: "red" });
    const mesh = new THREE.Mesh(geometry, material);
    const container = new THREE.Object3D();
    container.position.copy(position);
    container.add(mesh);
    return container;
  }

  private onCollisionEnter = (payload: CollisionEnterPayload) => {
    this._parentInstance.removeBullet(this.id);
    console.log(payload);

    // payload.colliderObject && this._scene.remove(payload.colliderObject);
  };

  private createBulletPhysicalObject(position: THREE.Vector3) {
    const RAPIER = this._RAPIER.rapier;
    const physics = this._RAPIER.world;
    const rigidBodyDesc = RAPIER.RigidBodyDesc.dynamic();
    rigidBodyDesc.setTranslation(position.x, position.y, position.z);
    const rigidBody = physics.createRigidBody(rigidBodyDesc);

    const colliderDesc = RAPIER.ColliderDesc.cuboid(
      BULLET_SIZE.width / 2,
      BULLET_SIZE.height / 2,
      BULLET_SIZE.depth / 2
    ).setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS);

    const collider = physics.createCollider(colliderDesc, rigidBody);

    return { rigidBody, collider };
  }

  public update() {
    this.directionVec.copy(this._direction);
    const velocity = this.directionVec.multiplyScalar(70);
    this._physicalObject.rigidBody.setLinvel(
      { x: velocity.x, y: 0, z: velocity.z },
      true
    );

    // const position = this._physicalObject.rigidBody.translation();
    // this._mesh.position.x = position.x;
    // this._mesh.position.y = position.y;
    // this._mesh.position.z = position.z;
  }

  public dispose() {
    this.update = () => {};
    this._scene.remove(this._mesh);
    this._RAPIER.world.removeRigidBody(this._physicalObject.rigidBody);
    this._RAPIER.world.removeCollider(this._physicalObject.collider, false);
    this._RAPIER.rigidBodyEvents.delete(this._physicalObject.rigidBody.handle);
    this._RAPIER.rigidBodyStates.delete(this._physicalObject.rigidBody.handle);
  }
}

export class Bullets {
  private _scene: THREE.Scene;

  private _bullets: Bullet[] = [];

  public get bullets(): Bullet[] {
    return this._bullets;
  }

  private _RAPIER: RapierContext;

  private set bullets(bulletData: BulletProps) {
    const newBullet = new Bullet(this, bulletData, this._scene, this._RAPIER);
    this._bullets.push(newBullet);
  }

  constructor(scene: THREE.Scene, RAPIER: RapierContext) {
    this._scene = scene;
    this._RAPIER = RAPIER;
  }

  public update() {
    this.bullets.forEach((bullet) => {
      bullet.update();
    });
  }

  public addBullet(bulletData: BulletProps) {
    this.bullets = bulletData;
  }

  public removeBullet(id: Number) {
    this._bullets = this._bullets.filter((bullet) => {
      const should = bullet.id !== id;
      !should && bullet.dispose();
      return should;
    });
  }

  public dispose() {
    this._bullets.forEach((b) => b.dispose());
    this._bullets = [];
  }

  private _enemies: THREE.Mesh[] = [];

  public get enemies() {
    return this._enemies;
  }

  public set enemies(newEnemies: THREE.Mesh | THREE.Mesh[]) {
    if (Array.isArray(newEnemies)) {
      newEnemies.forEach((enemy) => {
        this._enemies.push(enemy);
      });
    } else {
      this._enemies.push(newEnemies);
    }
  }

  public removeEnemy = (enemy: THREE.Mesh) => {
    this._enemies = this._enemies.filter((e) => e !== enemy);
  };
}


