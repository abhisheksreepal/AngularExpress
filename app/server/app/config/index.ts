import  * as data from './config.json';

export let mongoDBConnectionString: string = `mongodb://${(<any>data).mongo.host}/${(<any>data).mongo.db}`;
export let applicationPort: number = (<any>data).server.port;
export let applicationHttpsPort: number = (<any>data).server.httpsport;

