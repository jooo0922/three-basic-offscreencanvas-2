'use strict';

import {
  init,
  state,
  pickPosition
} from './shared-picking.js';

function size(data) {
  state.width = data.width;
  state.height = data.height;
}

/**
 * 마우스 이벤트의 좌표값도 캔버스 사이즈와 마찬가지로 
 * DOM에서 바로 마우스 이벤트의 좌표를 접근할 수 없기 때문에
 * 워커용 스크립트로 보내온 메시지를 받아서, 거기에 담긴 포인터의 x, y좌표값을
 * pickPosition.x, y에 매번 업데이트하는 함수가 필요함.
 */
function mouse(data) {
  pickPosition.x = data.x;
  pickPosition.y = data.y;
}

const handlers = {
  init,
  mouse,
  size
};

self.onmessage = function (e) {
  const fn = handlers[e.data.type];
  if (!fn) {
    throw new Error('no handler for type: ' + e.data.type);
  }
  fn(e.data);
}