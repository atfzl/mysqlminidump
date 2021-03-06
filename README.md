# ! NEEDS mysqldump utility installed to work

# mysqlminidump

Create small mysql dumps from your production database.

Dumps your main table and all the required tables with foreign key constraints.  
Create fake foreign key constraints if you need.


## install

`npm install -g mysqlminidump`  
can be used with any version of node. Tested with 4.2.6 and 0.12.7

## usage

`mysqlminidump ~/config.json`  

config.json sample:

```
{
  "verbose": true,
  "chunkSize": 1000,
  "resultFile": "dump.sql",
  "mysqlConfig": {
    "host"     : "localhost",
    "user"     : "root",
    "password" : "password",
    "database" : "database"
  },
  "dumpConfig": {
    "table"       : "product",
    "primaryKey"  : "id",
    "starterQuery": "select * from product limit 100;"
  },
  "mysqldumpOptions": [],
  "overridePrimaryKey": {
    "category": "id"
  },
  "fakeConstraints": [{
    "TABLE_NAME"             : "product",
    "COLUMN_NAME"            : "merchant_id",
    "REFERENCED_TABLE_NAME"  : "merchant",
    "REFERENCED_COLUMN_NAME" : "id"
  }]
}

```
#### verbose  
show logs

#### chunkSize
many dumps are created which are appended to the same file,
this option tells how many ids to use to create a dump.

#### resultFile
output dump file path

#### mysqlConfig
mysql configuration

#### dumpConfig
* table: name of the main table
* primaryKey: primary key of main table
* starterQuery: the query to start the dump process

#### mysqldumpOptions
array of mysqldump [options](http://dev.mysql.com/doc/refman/5.7/en/mysqldump.html)

#### overridePrimaryKey
I have assumed primary key of all tables is `id`, to override use  
```
--
"overridePrimaryKey": {
  tableName1: primaryKey1,
  tableName2: primaryKey2
}
--
```

#### fakeContraints
array of objects to inject fake foreign key constraints

--------------------------------------------

## Example

```
--
"dump": {
    "table"      : "product",
    "primaryKey" : "id",
    "offset"     : 0,
    "limit"      : 2
  },
--
```



 `FOREIGN KEY (category_id) REFERENCES category (id)`  
 `FOREIGN KEY (merchant_id) REFERENCES merchant (id)`  
 `brand_id` is not a foreign key so we add an object in fakeConstraints
 
 ```
 --
 "fakeConstraints": [{
    "TABLE_NAME"             : "product",
    "COLUMN_NAME"            : "brand_id",
    "REFERENCED_TABLE_NAME"  : "brand",
    "REFERENCED_COLUMN_NAME" : "id"
  }]
 --
 ```
 
1. product
   
    | id | category_id | merchant_id | brand_id |
    |----|-------------|-------------|----------|
    |  1 |        5000 |         100 | 901      | 
    |  2 |        5000 |         101 | 902      |
    |  3 |        5002 |         102 | 903      |
    | .. | ..          | ..          | ..       |

2. category

    |   id | name      |
    |------|-----------|
    | 5000 | category0 |
    | 5001 | category1 |
    | 5003 | category3 |
    | ..   | ..        |

    
3. merchant
  
    |  id | name      |
    |-----|-----------|
    | 100 | merchant0 |
    | 101 | merchant1 |
    | 102 | merchant2 |
    | ..  | ..        |
4. brand 

    |  id | name      |
    |-----|-----------|
    | 901 | brand1    |
    | 902 | brand2    |
    | 903 | brand3    |
    | ..  | ..        |
        
resulting dump ids:

1. product  : [1,2]
2. category : [5000]
3. merchant : [100, 101]
4. brand    : [901, 902]

