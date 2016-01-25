import shell     from 'shelljs';
import _         from 'lodash';
import P         from 'bluebird';
import config    from './config';

shell.config.silent = true;

let exec = P.promisify(shell.exec, {context: shell, multiArgs: true});

let mysqldumpBase = `mysqldump -h${config.mysql.host} -u${config.mysql.user} -p${config.mysql.password} ${config.mysql.database}`;

export default function createDump (primaryIdsMap) {
  let tableDumps = _.map(primaryIdsMap, (ids, table) => {
    let primaryKey = _.get(config, 'overridePrimaryKey[table]') || 'id';
    return `${table} --where "${primaryKey} in (${_.keys(ids._set)})"`;
  }).join(' ');

  let mysqldumpOptions = config.mysqldumpOptions
        .map(val => `--${val}`).join(' ');
  
  let resultFile = `--result-file ${config.resultFile}`;
  
  let finalDumpQuery = `${mysqldumpBase} ${tableDumps} ${mysqldumpOptions} ${resultFile}`;
  
  if (config.verbose)
    console.log(finalDumpQuery);
  
  return exec(finalDumpQuery)
    .then((stdout, stderr) => {
      return stderr
        ? P.reject(`mysqldump Error: ${stderr}`)
        : P.resolve(config.resultFile);
    }).catch((code) => P.reject('mysqldump error. Please try running with verbose option'));
};
