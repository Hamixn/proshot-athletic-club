import assert from 'assert';
import {
  clamp,
  lerp,
  viewProgress,
  centerOffset,
  exitProgress,
  sceneProgress,
} from '../frontend/src/lib/motion/math.ts';

assert.strictEqual(clamp(5), 1);
assert.strictEqual(clamp(-2), 0);
assert.strictEqual(lerp(0, 10, 0.5), 5);
assert.strictEqual(viewProgress(800, 400, 800), 0); // just entering
assert.strictEqual(viewProgress(-400, 400, 800), 1); // just left
assert.strictEqual(centerOffset(400 - 100, 200, 800), 0); // centred
assert.strictEqual(exitProgress(0, 700), 0); // hero at rest
assert.strictEqual(exitProgress(-700, 700), 1); // hero gone
assert.strictEqual(sceneProgress(800, 640, 800), 0); // scene entering viewport bottom
assert.strictEqual(sceneProgress(-640, 640, 800), 1); // scene leaving viewport top
console.log('✅ 9. Motion & Parallax Math Engine: Passed');
