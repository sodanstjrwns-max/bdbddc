// Pure gameplay rules: state changes never depend on rendering or frame rate.
export const MAX_HEALTH=5;
export function createRun(){return {hp:MAX_HEALTH,stamina:100,shards:0,lit:[false,false,false],time:0,deaths:0,finished:false};}
export function addShard(state){state.shards++;if(state.shards%3===0)state.hp=Math.min(MAX_HEALTH,state.hp+1);}
export function lightBeacon(state,index,guardsRemaining){if(index<0||index>=3||guardsRemaining||state.lit[index])return false;state.lit[index]=true;state.hp=MAX_HEALTH;return true;}
export function canFinish(state){return state.lit.every(Boolean);}
export function resolveDamage(state,amount,invulnerable){if(invulnerable||state.finished)return false;state.hp=Math.max(0,state.hp-amount);return true;}
export function restoreAtCheckpoint(state){state.hp=MAX_HEALTH;state.stamina=100;state.deaths++;}
export function wrapAngle(a){return Math.atan2(Math.sin(a),Math.cos(a));}
