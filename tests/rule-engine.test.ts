import {describe,it,expect} from 'vitest';
function score(weights:Record<string,number>,selected:string[]){return Object.entries(weights).filter(([id])=>selected.includes(id)).reduce((a,[,w])=>a+w,0)}
describe('rule scoring',()=>{it('calculates weighted rule match score',()=>{expect(score({fever:30,chills:20,headache:15},['fever','chills','headache'])).toBe(65)});it('does not invent missing symptoms',()=>{expect(score({fever:30,chills:20,headache:15},['fever'])).toBe(30)});it('supports no-match threshold',()=>{expect(score({a:20,b:20},['a'])).toBeLessThan(50)})});
