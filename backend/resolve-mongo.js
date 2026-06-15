const dns = require('dns');
const { promisify } = require('util');
const resolveSrv = promisify(dns.resolveSrv);
const resolveTxt = promisify(dns.resolveTxt);

async function getRawMongoUri() {
  const hostname = 'cluster0.b8e4hcy.mongodb.net';
  
  try {
    const srvRecords = await resolveSrv(`_mongodb._tcp.${hostname}`);
    console.log('SRV Records:', srvRecords);
    
    const hosts = srvRecords.map(record => `${record.name}:${record.port}`).join(',');
    console.log('Hosts:', hosts);
    
    let txtRecordStr = '';
    try {
      const txtRecords = await resolveTxt(hostname);
      txtRecordStr = txtRecords.flat().join('&');
      console.log('TXT Records:', txtRecordStr);
    } catch (e) {
      console.log('No TXT records');
    }

    const rawUri = `mongodb://atharav:Atharav$2608@${hosts}/xenoreach?ssl=true&replicaSet=atlas-xxx&authSource=admin${txtRecordStr ? '&' + txtRecordStr : ''}`;
    console.log('\nRAW URI (approx):', rawUri);
  } catch (err) {
    console.error('Error resolving:', err);
  }
}

getRawMongoUri();
