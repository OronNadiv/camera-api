export const up = (knex, Promise) => {
  return knex.transaction(trx => {
    return Promise
      .try(() => {
        return trx.schema.table('files', table => {
          table.dropColumn('created_by_id')
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
