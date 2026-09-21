// Exercise the actual local STATIC FIELD HTTP action route, not the deterministic
// First Bell CLI fixture. SOURCE owns and persists these native browser actions.
import {startStaticFieldServer} from '../static-field/build/src/server/app.js';
const args=process.argv.slice(2),n=args.indexOf('--log'),path=n>=0?args[n+1]:null;
if(!path)throw new Error('usage: node scripts/browser-path-smoke.js --log <fresh source event log path>');
const actions=[
 'ENTER_PORCH','SET_OUT_CHAIR','ROUTE_CABLE','PUT_OUT_WATER','CHECK_DOOR',
 'BELL_1','CONTINUE_PREPARATION','BELL_2','NOTICE_OPEN_CORNER',
 'ENTER_RESONANCE','TRACE_PRIOR_RELATION','KNOCK','CLOSE_PLAY',
];
const running=await startStaticFieldServer({port:0,eventLogPath:path});
try{
 let state;
 for(const action of actions){
  const response=await fetch(running.url+'/api/action',{method:'POST',headers:{'content-type':'application/json'},
   body:JSON.stringify({action})});
  state=await response.json();
  if(!response.ok)throw new Error(`native HTTP ${action}: ${JSON.stringify(state)}`);
 }
 if(state.story.status!=='closed'||!state.story.relationTraced||state.story.bellCount!==2)
  throw new Error('NATIVE_BROWSER_PATH_INCOMPLETE');
 const history=await (await fetch(running.url+'/api/history')).json();
 if(history.length!==actions.length||history.at(-1)?.kind!=='FIRST_BELL_PLAY_CLOSED')
  throw new Error('NATIVE_BROWSER_HISTORY_INCOMPLETE');
 console.log(`played ${actions.length} actual source HTTP actions -> ${path}`);
}finally{await running.close();}
