import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

const uuidColumnType = (driver: QueryRunner['connection']['options']['type']) =>
  driver === 'sqlite' ? 'varchar' : 'uuid';

const timestampColumnType = (driver: QueryRunner['connection']['options']['type']) =>
  driver === 'sqlite' ? 'datetime' : 'timestamp';

const nowDefault = (driver: QueryRunner['connection']['options']['type']) =>
  driver === 'sqlite' ? 'CURRENT_TIMESTAMP' : 'now()';

export class InitSchema1700000000000 implements MigrationInterface {
  name = 'InitSchema1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const driverType = queryRunner.connection.options.type;
    const uuidType = uuidColumnType(driverType);
    const timestampType = timestampColumnType(driverType);
    const timestampDefault = nowDefault(driverType);

    await queryRunner.createTable(
      new Table({
        name: 'role',
        columns: [
          {
            name: 'id',
            type: uuidType,
            isPrimary: true,
          },
          {
            name: 'name',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'createdAt',
            type: timestampType,
            default: timestampDefault,
          },
          {
            name: 'updatedAt',
            type: timestampType,
            default: timestampDefault,
          },
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'user',
        columns: [
          { name: 'id', type: uuidType, isPrimary: true },
          { name: 'email', type: 'varchar', isUnique: true },
          { name: 'password', type: 'varchar' },
          { name: 'firstName', type: 'varchar' },
          { name: 'lastName', type: 'varchar' },
          { name: 'createdAt', type: timestampType, default: timestampDefault },
          { name: 'updatedAt', type: timestampType, default: timestampDefault },
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'task',
        columns: [
          { name: 'id', type: uuidType, isPrimary: true },
          { name: 'title', type: 'varchar' },
          { name: 'description', type: 'text', isNullable: true },
          { name: 'status', type: 'varchar', default: "'todo'" },
          { name: 'ownerId', type: uuidType },
          { name: 'createdAt', type: timestampType, default: timestampDefault },
          { name: 'updatedAt', type: timestampType, default: timestampDefault },
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['ownerId'],
            referencedTableName: 'user',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'task_attachment',
        columns: [
          { name: 'id', type: uuidType, isPrimary: true },
          { name: 'filename', type: 'varchar' },
          { name: 'mimetype', type: 'varchar' },
          { name: 'path', type: 'varchar' },
          { name: 'taskId', type: uuidType },
          { name: 'createdAt', type: timestampType, default: timestampDefault },
          { name: 'updatedAt', type: timestampType, default: timestampDefault },
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['taskId'],
            referencedTableName: 'task',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'user_roles_role',
        columns: [
          { name: 'userId', type: uuidType, isPrimary: true },
          { name: 'roleId', type: uuidType, isPrimary: true },
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['userId'],
            referencedTableName: 'user',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
          new TableForeignKey({
            columnNames: ['roleId'],
            referencedTableName: 'role',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'task_assignees_user',
        columns: [
          { name: 'taskId', type: uuidType, isPrimary: true },
          { name: 'userId', type: uuidType, isPrimary: true },
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['taskId'],
            referencedTableName: 'task',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
          new TableForeignKey({
            columnNames: ['userId'],
            referencedTableName: 'user',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
        ],
      }),
    );

    // Seed default roles
    const isSqlite = driverType === 'sqlite';
    
    if (isSqlite) {
      // SQLite syntax
      await queryRunner.query(`
        INSERT OR IGNORE INTO role (id, name, "createdAt", "updatedAt") VALUES
        ('7c1c451c-5d56-4c9d-8b3d-f43a5e46b06f', 'admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('52aef89e-4ba0-4c6c-9c2c-3c9a2432f795', 'manager', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('bdf7d1c7-8431-44e0-8f72-8f0bb7a64552', 'user', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `);
    } else {
      // PostgreSQL syntax
      await queryRunner.query(`
        INSERT INTO role (id, name, "createdAt", "updatedAt") VALUES
        (gen_random_uuid(), 'admin', now(), now()),
        (gen_random_uuid(), 'manager', now(), now()),
        (gen_random_uuid(), 'user', now(), now())
        ON CONFLICT (name) DO NOTHING
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('task_assignees_user');
    await queryRunner.dropTable('user_roles_role');
    await queryRunner.dropTable('task_attachment');
    await queryRunner.dropTable('task');
    await queryRunner.dropTable('user');
    await queryRunner.dropTable('role');
  }
}

