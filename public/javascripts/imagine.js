!function (t, e) {
  'function' == typeof define && define.amd ? define(e)  : 'object' == typeof exports ? module.exports = e()  : t.imagine = e()
}(this, function () {
  var t,
  e,
  i;
  return function (n) {
    function o(t, e) {
      return m.call(t, e)
    }
    function s(t, e) {
      var i,
      n,
      o,
      s,
      r,
      a,
      c,
      h,
      p,
      u,
      f,
      l = e && e.split('/'),
      d = y.map,
      v = d && d['*'] || {
      };
      if (t && '.' === t.charAt(0))
      if (e) {
        for (l = l.slice(0, l.length - 1), t = t.split('/'), r = t.length - 1, y.nodeIdCompat && j.test(t[r]) && (t[r] = t[r].replace(j, '')), t = l.concat(t), p = 0; p < t.length; p += 1)
        if (f = t[p], '.' === f) t.splice(p, 1),
        p -= 1;
         else if ('..' === f) {
          if (1 === p && ('..' === t[2] || '..' === t[0])) break;
          p > 0 && (t.splice(p - 1, 2), p -= 2)
        }
        t = t.join('/')
      } else 0 === t.indexOf('./') && (t = t.substring(2));
      if ((l || v) && d) {
        for (i = t.split('/'), p = i.length; p > 0; p -= 1) {
          if (n = i.slice(0, p).join('/'), l)
          for (u = l.length; u > 0; u -= 1)
          if (o = d[l.slice(0, u).join('/')], o && (o = o[n])) {
            s = o,
            a = p;
            break
          }
          if (s) break;
          !c && v && v[n] && (c = v[n], h = p)
        }
        !s && c && (s = c, a = h),
        s && (i.splice(0, a, s), t = i.join('/'))
      }
      return t
    }
    function r(t, e) {
      return function () {
        return l.apply(n, O.call(arguments, 0).concat([t,
        e]))
      }
    }
    function a(t) {
      return function (e) {
        return s(e, t)
      }
    }
    function c(t) {
      return function (e) {
        b[t] = e
      }
    }
    function h(t) {
      if (o(g, t)) {
        var e = g[t];
        delete g[t],
        w[t] = !0,
        f.apply(n, e)
      }
      if (!o(b, t) && !o(w, t)) throw new Error('No ' + t);
      return b[t]
    }
    function p(t) {
      var e,
      i = t ? t.indexOf('!')  : - 1;
      return i > - 1 && (e = t.substring(0, i), t = t.substring(i + 1, t.length)),
      [
        e,
        t
      ]
    }
    function u(t) {
      return function () {
        return y && y.config && y.config[t] || {
        }
      }
    }
    var f,
    l,
    d,
    v,
    b = {
    },
    g = {
    },
    y = {
    },
    w = {
    },
    m = Object.prototype.hasOwnProperty,
    O = [
    ].slice,
    j = /\.js$/;
    d = function (t, e) {
      var i,
      n = p(t),
      o = n[0];
      return t = n[1],
      o && (o = s(o, e), i = h(o)),
      o ? t = i && i.normalize ? i.normalize(t, a(e))  : s(t, e)  : (t = s(t, e), n = p(t), o = n[0], t = n[1], o && (i = h(o))),
      {
        f: o ? o + '!' + t : t,
        n: t,
        pr: o,
        p: i
      }
    },
    v = {
      require: function (t) {
        return r(t)
      },
      exports: function (t) {
        var e = b[t];
        return 'undefined' != typeof e ? e : b[t] = {
        }
      },
      module: function (t) {
        return {
          id: t,
          uri: '',
          exports: b[t],
          config: u(t)
        }
      }
    },
    f = function (t, e, i, s) {
      var a,
      p,
      u,
      f,
      l,
      y,
      m = [
      ],
      O = typeof i;
      if (s = s || t, 'undefined' === O || 'function' === O) {
        for (e = !e.length && i.length ? [
          'require',
          'exports',
          'module'
        ] : e, l = 0; l < e.length; l += 1)
        if (f = d(e[l], s), p = f.f, 'require' === p) m[l] = v.require(t);
         else if ('exports' === p) m[l] = v.exports(t),
        y = !0;
         else if ('module' === p) a = m[l] = v.module(t);
         else if (o(b, p) || o(g, p) || o(w, p)) m[l] = h(p);
         else {
          if (!f.p) throw new Error(t + ' missing ' + p);
          f.p.load(f.n, r(s, !0), c(p), {
          }),
          m[l] = b[p]
        }
        u = i ? i.apply(b[t], m)  : void 0,
        t && (a && a.exports !== n && a.exports !== b[t] ? b[t] = a.exports : u === n && y || (b[t] = u))
      } else t && (b[t] = i)
    },
    t = e = l = function (t, e, i, o, s) {
      if ('string' == typeof t) return v[t] ? v[t](e)  : h(d(t, e).f);
      if (!t.splice) {
        if (y = t, y.deps && l(y.deps, y.callback), !e) return;
        e.splice ? (t = e, e = i, i = null)  : t = n
      }
      return e = e || function () {
      },
      'function' == typeof i && (i = o, o = s),
      o ? f(n, t, e, i)  : setTimeout(function () {
        f(n, t, e, i)
      }, 4),
      l
    },
    l.config = function (t) {
      return l(t)
    },
    t._defined = b,
    i = function (t, e, i) {
      e.splice || (i = e, e = [
      ]),
      o(b, t) || o(g, t) || (g[t] = [
        t,
        e,
        i
      ])
    },
    i.amd = {
      jQuery: !0
    }
  }(),
  i('../bower_components/almond/almond.js', function () {
  }),
  function (t, e) {
    'object' == typeof exports && module ? module.exports = e()  : 'function' == typeof i && i.amd ? i('../bower_components/pubsub-js/src/pubsub', e)  : t.PubSub = e()
  }('object' == typeof window && window || this, function () {
    function t(t) {
      var e;
      for (e in t)
      if (t.hasOwnProperty(e)) return !0;
      return !1
    }
    function e(t) {
      return function () {
        throw t
      }
    }
    function i(t, i, n) {
      try {
        t(i, n)
      } catch (o) {
        setTimeout(e(o), 0)
      }
    }
    function n(t, e, i) {
      t(e, i)
    }
    function o(t, e, o, s) {
      var r,
      a = h[e],
      c = s ? n : i;
      if (h.hasOwnProperty(e))
      for (r in a) a.hasOwnProperty(r) && c(a[r], t, o)
    }
    function s(t, e, i) {
      return function () {
        var n = String(t),
        s = n.lastIndexOf('.');
        for (o(t, t, e, i); - 1 !== s; ) n = n.substr(0, s),
        s = n.lastIndexOf('.'),
        o(t, n, e)
      }
    }
    function r(e) {
      for (var i = String(e), n = Boolean(h.hasOwnProperty(i) && t(h[i])), o = i.lastIndexOf('.'); !n && - 1 !== o; ) i = i.substr(0, o),
      o = i.lastIndexOf('.'),
      n = Boolean(h.hasOwnProperty(i) && t(h[i]));
      return n
    }
    function a(t, e, i, n) {
      var o = s(t, e, n),
      a = r(t);
      return a ? (i === !0 ? o()  : setTimeout(o, 0), !0)  : !1
    }
    var c = {
    },
    h = {
    },
    p = - 1;
    return c.publish = function (t, e) {
      return a(t, e, !1, c.immediateExceptions)
    },
    c.publishSync = function (t, e) {
      return a(t, e, !0, c.immediateExceptions)
    },
    c.subscribe = function (t, e) {
      if ('function' != typeof e) return !1;
      h.hasOwnProperty(t) || (h[t] = {
      });
      var i = 'uid_' + String(++p);
      return h[t][i] = e,
      i
    },
    c.unsubscribe = function (t) {
      var e,
      i,
      n,
      o = 'string' == typeof t,
      s = !1;
      for (e in h)
      if (h.hasOwnProperty(e)) {
        if (i = h[e], o && i[t]) {
          delete i[t],
          s = t;
          break
        }
        if (!o)
        for (n in i) i.hasOwnProperty(n) && i[n] === t && (delete i[n], s = !0)
      }
      return s
    },
    c
  }),
  i('pubsub', [
    '../bower_components/pubsub-js/src/pubsub'
  ], function (t) {
    function e(e, i) {
      return t.publish(e, i)
    }
    function i(e, i) {
      return t.subscribe(e, i)
    }
    return {
      publish: e,
      subscribe: i
    }
  }),
  i('util/mouse', [
  ], function () {
    function t(t, e) {
      var i = e.getBoundingClientRect();
      return {
        x: t.clientX - i.left * (e.width / i.width),
        y: t.clientY - i.top * (e.height / i.height)
      }
    }
    function e(t, e, i, n) {
      var o,
      s,
      r = e.options,
      a = 0,
      c = 0,
      h = i.width - r.width,
      p = i.height - r.height;
      return o = t.x - n.x,
      o = a > o ? a : o > h ? h : o,
      s = t.y - n.y,
      s = c > s ? c : s > p ? p : s,
      {
        x: o,
        y: s
      }
    }
    function i(t, e) {
      var i = t.options;
      return i.left <= e.x && e.x <= i.left + i.width && i.top <= e.y && e.y <= i.top + i.height
    }
    function n(t, e) {
      for (var n, o = - 1, s = e.length, r = 0; s > r; r++) {
        var a = e[r],
        c = i(a, t);
        c && r > o && (n = r)
      }
      return n ? e[n] : !1
    }
    return {
      windowToCanvas: t,
      clampToCanvas: e,
      isTargetHit: i,
      getTargetObject: n
    }
  }),
  i('events', [
    'pubsub',
    'util/mouse'
  ], function (t, e) {
    function i(t) {
      var i = e.windowToCanvas(t, this.canvas),
      n = e.getTargetObject(i, this.canvasObjects);
      f = n ? !0 : !1,
      this.clearActiveObject(),
      n && c.apply(this, [
        t,
        n
      ]),
      n && f && s.apply(this, [
        t,
        n,
        i,
        l
      ]),
      this.canvas.removeEventListener('mousedown', this, !1),
      window.addEventListener('mouseup', this, !1)
    }
    function n(t) {
      var i,
      n = this.getActiveObject(),
      o = e.windowToCanvas(t, this.canvas);
      f && n && r.apply(this, [
        t,
        n,
        o,
        l
      ]),
      f || (i = e.getTargetObject(o, this.canvasObjects), h.apply(this, [
        t,
        i
      ])),
      n && n !== i && !f && u.apply(this, [
        t,
        n
      ])
    }
    function o(t) {
      var i = e.windowToCanvas(t, this.canvas),
      n = e.getTargetObject(i, this.canvasObjects);
      if (this.canvas.addEventListener('mousedown', this, !1), window.removeEventListener('mouseup', this, !1), n && f && (f = !1, a.apply(this, [
        t,
        n
      ])), n && p.apply(this, [
        t,
        n
      ]), !n && f) {
        f = !1;
        var o = this.getActiveObject();
        o && (o.trigger('dragend'), this.canvas.style.cursor = 'default')
      }
    }
    function s(e, i, n, o) {
      o.x = n.x - i.options.left,
      o.y = n.y - i.options.top,
      window.addEventListener('mousemove', this, !1),
      t.publish('dragstart', {
        event: e,
        object: i
      })
    }
    function r(i, n, o, s) {
      var r = n.options,
      a = e.clampToCanvas(o, n, this.canvas, s);
      r.left = a.x,
      r.top = a.y,
      t.publish('dragging', {
        event: i,
        object: n
      })
    }
    function a(e, i) {
      t.publish('dragend', {
        event: e,
        object: i
      })
    }
    function c(e, i) {
      this.setActiveObject(i),
      i.isActive = !0,
      t.publish('mousedown', {
        event: e,
        object: i
      })
    }
    function h(e, i) {
      this.setActiveObject(i),
      this.setCursorOnActiveObject(i),
      t.publish('mouseover', {
        event: e,
        object: i
      })
    }
    function p(e, i) {
      t.publish('mouseup', {
        event: e,
        object: i
      })
    }
    function u(e, i) {
      t.publish('mouseout', {
        event: e,
        object: i
      })
    }
    var f,
    l = {
    };
    return {
      mouseDownListener: i,
      mouseMoveListener: n,
      mouseUpListener: o,
      dragStartObject: s,
      dragObject: r,
      dragEndObject: a,
      mouseDownObject: c,
      mouseOverObject: h,
      mouseUpObject: p,
      mouseOutObject: u
    }
  }),
  i('canvas', [
    'events'
  ], function (t) {
    function e(t) {
      this.id = t,
      this.canvas = document.getElementById(this.id),
      this.ctx = this.canvas.getContext('2d'),
      this.canvas.addEventListener('mousedown', this, !1),
      this.canvas.addEventListener('mousemove', this, !1),
      this.canvasObjects = [
      ]
    }
    return e.prototype.getCanvasId = function () {
      return this.id
    },
    e.prototype.getCanvas = function () {
      return this.canvas
    },
    e.prototype.getContext = function () {
      return this.ctx
    },
    e.prototype.getObjectCount = function () {
      return this.canvasObjects.length
    },
    e.prototype.getActiveObject = function () {
      return this.activeObject
    },
    e.prototype.setActiveObject = function (t) {
      this.activeObject = t
    },
    e.prototype.clearActiveObject = function () {
      for (var t = this.getObjectCount(), e = 0; t > e; e++) this.canvasObjects[e].isActive = !1
    },
    e.prototype.toDataURL = function (t) {
      return this.canvas.toDataURL(t)
    },
    e.prototype.remove = function (t) {
      var e = this.canvasObjects.indexOf(t);
      return - 1 !== e && (this.canvasObjects.splice(e, 1), this.reDrawObjects()),
      this
    },
    e.prototype.add = function (t) {
      t.draw(this.ctx),
      t.options.layer = this.getObjectCount() + 1,
      this.canvasObjects.push(t)
    },
    e.prototype.reDrawObjects = function () {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      for (var t = this.getObjectCount(), e = 0; t > e; e++) {
        var i = this.canvasObjects[e];
        i.draw(this.ctx)
      }
    },
    e.prototype.setCursorOnActiveObject = function (t) {
      this.canvas.style.cursor = t ? 'move' : 'default'
    },
    e.prototype.handleEvent = function (e) {
      switch (e.type) {
        case 'mousedown':
          t.mouseDownListener.apply(this, [
            e
          ]);
          break;
        case 'mousemove':
          t.mouseMoveListener.apply(this, [
            e
          ]);
          break;
        case 'mouseup':
          t.mouseUpListener.apply(this, [
            e
          ])
      }
      this.reDrawObjects()
    },
    e
  }), i('shapes/shape', [
    'pubsub'
  ], function (t) {
    function e() {
    }
    return e.prototype.initializeOptions = function (t, e) {
      this.isActive = !1,
      this.options = e || {
      };
      for (var i in t) this.options[i] = this.options[i] || t[i]
    },
    e.prototype.set = function (t) {
      for (var e in t) this.options[e] = t[e]
    },
    e.prototype.drawBorder = function (t) {
      var e = 1;
      t.save(),
      t.strokeStyle = 'skyblue',
      t.lineWidth = e,
      t.strokeRect(this.options.left - e / 2, this.options.top - e / 2, this.options.width + e, this.options.height + e),
      t.restore()
    },
    e.prototype.on = function (e, i) {
      var n = this;
      t.subscribe(e, function (t, e) {
        n === e.object && i && i.apply(n, [
          t,
          e
        ])
      })
    },
    e.prototype.trigger = function (e) {
      t.publish(e, {
        object: this
      })
    },
    e
  }), i('shapes/rectangle', [
    'shapes/shape'
  ], function (t) {
    function e(t) {
      this.type = 'rectangle',
      this.initializeOptions(i, t)
    }
    var i = {
      left: 0,
      top: 0,
      fill: 'black',
      width: 100,
      height: 100,
      strokeStyle: '#fff',
      strokeWidth: null
    };
    return e.prototype = new t,
    e.prototype.draw = function (t) {
      t.fillStyle = this.options.fill,
      t.fillRect(this.options.left, this.options.top, this.options.width, this.options.height),
      t.strokeStyle = this.options.strokeStyle,
      t.lineWidth = this.options.strokeWidth,
      this.options.strokeWidth && t.strokeRect(this.options.left, this.options.top, this.options.width, this.options.height),
      this.isActive && this.drawBorder(t)
    },
    e
  }), i('shapes/circle', [
    'shapes/shape'
  ], function (t) {
    function e(t) {
      this.type = 'circle',
      this.initializeOptions(i, t);
      var e = this.options.width || 2 * this.options.radius,
      n = this.options.height || 2 * this.options.radius;
      this.options.width = e,
      this.options.height = n
    }
    var i = {
      left: 0,
      top: 0,
      fill: 'black',
      radius: 25
    };
    return e.prototype = new t,
    e.prototype.draw = function (t) {
      t.beginPath(),
      t.arc(this.options.left + this.options.radius, this.options.top + this.options.radius, this.options.radius, 0, 2 * Math.PI, !1),
      t.fillStyle = this.options.fill,
      t.fill(),
      this.options.strokeWidth && t.strokeRect(this.options.left, this.options.top, this.options.width, this.options.height),
      this.isActive && this.drawBorder(t)
    },
    e
  }), i('shapes/image', [
    'shapes/shape'
  ], function (t) {
    function e(t, e) {
      this.type = 'image',
      this.imageObj = t,
      e.width = e.width || this.imageObj.width,
      e.height = e.height || this.imageObj.height,
      this.initializeOptions(i, e)
    }
    var i = {
      left: 0,
      top: 0,
      angle: 0,
      opacity: 1
    };
    return e.prototype = new t,
    e.prototype.draw = function (t) {
      t.drawImage(this.imageObj, this.options.left, this.options.top, this.options.width, this.options.height),
      this.isActive && this.drawBorder(t)
    },
    e
  }), i('shapes/text', [
    'shapes/shape'
  ], function (t) {
    function e(t) {
      this.type = 'text',
      this.initializeOptions(i, t)
    }
    var i = {
      left: 0,
      top: 0,
      font: 'Times New Roman',
      fontSize: 24,
      fontWeight: 'normal',
      text: 'text',
      lineHeight: 1.3,
      baseline: 'top',
      fill: 'black',
      strokeStyle: null,
      strokeWidth: 0
    };
    return e.prototype = new t,
    e.prototype.getLineHeight = function () {
      return this.options.fontSize * this.options.lineHeight
    },
    e.prototype.draw = function (t) {
      t.font = this.options.fontSize + 'px ' + this.options.font,
      t.fillStyle = this.options.fill,
      t.textBaseline = this.options.baseline;
      var e = t.measureText(this.options.text),
      i = e.width,
      n = this.options.height || this.getLineHeight();
      this.options.width = i,
      this.options.height = n,
      t.strokeStyle = 'black',
      t.lineWidth = 5,
      t.strokeText(this.options.text, this.options.left, this.options.top),
      t.fillText(this.options.text, this.options.left, this.options.top),
      this.options.strokeWidth && t.strokeRect(this.options.left, this.options.top, this.options.width, this.options.height),
      this.isActive && this.drawBorder(t)
    },
    e
  }), i('imagine', [
    'canvas',
    'shapes/rectangle',
    'shapes/circle',
    'shapes/image',
    'shapes/text'
  ], function (t, e, i, n, o) {
    var s = function (t) {
      return t
    };
    return s.Canvas = t,
    s.Rectangle = e,
    s.Circle = i,
    s.Image = n,
    s.Text = o,
    s
  }), e('imagine')
});
