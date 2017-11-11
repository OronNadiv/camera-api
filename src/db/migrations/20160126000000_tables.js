export const up = (knex, Promise) => {
  return knex.transaction(trx => {
    return Promise
      .try(() => {
        return trx.schema.createTable('files', table => {
          table.increments('id').primary()
          table.string('name').notNullable()
          table.string('bucket').notNullable()
          table.string('key').notNullable()
          table.boolean('is_deleted').defaultTo(false).notNullable()
          table.integer('size').notNullable()
          table.integer('group_id').notNullable()
            .references('id')
            .inTable('public.groups')
            .onDelete('CASCADE')
            .onUpdate('CASCADE')
          table.integer('created_by_id').notNullable()
            .references('id')
            .inTable('public.machines')
            .onDelete('CASCADE')
            .onUpdate('CASCADE')
          table.timestamps()
        })
      })
  })
}

export const down = knex => {
  return knex.transaction(trx => {
    return Promise
      .resolve(trx.schema.dropTable('files'))
  })
}
