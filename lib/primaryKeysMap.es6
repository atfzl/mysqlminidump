import P      from 'bluebird';
import _      from 'lodash';
import config from './config';

import {
  getMainTableRows,
  getTableRows,
  getForeignKeyMap
} from './utils';

let { dumpConfig } = config;

export default function getPrimaryKeyMap () {
  return P.all([getMainTableRows(dumpConfig), getForeignKeyMap(dumpConfig)])
    .spread((rows, foreignKeyMap) => {
      mapInterface.fill(dumpConfig.table, _.map(rows, dumpConfig.primaryKey));
      return core(rows, foreignKeyMap);
    })
    .then(() => P.resolve(mapInterface.get()) );
}

function recursiveResolve ({table, ids}) {
  return P.all([getTableRows({table, ids}), getForeignKeyMap({table})])
    .spread(core);
}

function core (rows, foreignKeyMap) {
  return P.all(_.map(foreignKeyMap, (val, column) => {
    let foreignIds = _(rows).map(column).uniq().compact().value();
    mapInterface.fill(val.REFERENCED_TABLE_NAME, foreignIds);
    
    return foreignIds.length
      ? recursiveResolve({table: val.REFERENCED_TABLE_NAME, ids: foreignIds})
      : P.resolve();
  }));
}

var mapInterface = (function() {
  let map = {};
  return {
    fill(table, ids) {
      if (map[table]) {
        ids.forEach(map[table].add.bind(map[table]));
      } else {
        map[table] = new Set(ids);
      }
    },
    get () {
      return map;
    }
  };
})();
