import * as THREE from "three";

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

  private _mesh: THREE.Mesh;

  private directionVec: THREE.Vector3 = new THREE.Vector3();

  constructor(
    parent: Bullets,
    { position, direction, id }: BulletProps,
    scene: THREE.Scene
  ) {
    this._position = position;
    this._direction = direction;
    this.id = id;

    this._scene = scene;

    this._mesh = this.createBulletMesh(this._position);
    this._scene.add(this._mesh);

    const d = this._direction.clone().multiply(new THREE.Vector3(100, 1, 100));
    d.y = 1.75;
    this._mesh.lookAt(d);

    setTimeout(() => {
      parent.removeBullet(id);
    }, 500);
  }

  private createBulletMesh(position: THREE.Vector3) {
    const geometry = new THREE.BoxGeometry(0.4, 0.4, 0.6);
    const material = new THREE.MeshStandardMaterial({ color: "red" });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);
    return mesh;
  }

  public update() {
    this.directionVec.copy(this._direction);
    this._position.add(this.directionVec.multiplyScalar(0.5));
    this._position.y = 1.75;
    this._mesh.position.copy(this._position);
  }

  public dispose() {
    this.update = () => {};
    this._scene.remove(this._mesh);
  }
}

export class Bullets {
  private _scene: THREE.Scene;

  private _bullets: Bullet[] = [];

  public get bullets(): Bullet[] {
    return this._bullets;
  }

  private set bullets(bulletData: BulletProps) {
    const newBullet = new Bullet(this, bulletData, this._scene);
    this._bullets.push(newBullet);
  }

  constructor(scene: THREE.Scene) {
    this._scene = scene;
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

type EnemyProps = { position: THREE.Vector3; id: Number };

class Enemy {
  private _scene: THREE.Scene;

  private _position: THREE.Vector3;

  public id: Number;

  private _health = 100

  private _mesh: THREE.Group;

  public addDamage (damage: number) {
    this._health -= damage;
    if(this._health <= 0){
        this.dispose();
    }
  }

  private _parentInstance: Enemies; 

  constructor(
    parent: Enemies,
    { position, id }: EnemyProps,
    scene: THREE.Scene
  ) {
    this._scene = scene;
    this._position = position;
    this.id = id;
    this._parentInstance = parent;

    this._mesh = this.createMesh(this._position);

    this._scene.add(this._mesh);
  }

  private createMesh (position: THREE.Vector3) {
    const mainGroup = new THREE.Group();
    const capsuleGeometry = new THREE.CapsuleGeometry(1, 1.5, 32, 32);
    const capsuleMaterial = new THREE.MeshStandardMaterial({color : "green"});
    const capsuleMesh = new THREE.Mesh(capsuleGeometry, capsuleMaterial);
    capsuleMesh.castShadow = true;
    mainGroup.add(capsuleMesh)
    const coneGeometry = new THREE.ConeGeometry(0.2, 0.5, 32, 32);
    const coneMaterial = new THREE.MeshStandardMaterial({color : "green"});
    const coneMesh = new THREE.Mesh(coneGeometry, coneMaterial);
    coneMesh.position.set(0, 1.5, -1.6);

    mainGroup.add(coneMesh)

    mainGroup.position.copy(position);
    return mainGroup
  }

  public update() {
    
  }

  public dispose() {
    this.update = () => {};
    this._scene.remove(this._mesh);
    this._parentInstance.removeEnemy(this.id);
  }
}

export class Enemies {
  private _scene: THREE.Scene;

  private _enemies: Enemy[] = [];

  constructor(scene: THREE.Scene) {
    this._scene = scene;
  }

  public addEnemy(data: EnemyProps) {
    const newEnemy = new Enemy(this, data, this._scene);
    this._enemies.push(newEnemy);
  }

  public removeEnemy(id: Number) {
    this._enemies = this._enemies.filter((enemy) => enemy.id !== id);
  }

  public update() {
    this._enemies.forEach((enemy) => enemy.update());
  }

  public dispose() {}
}
