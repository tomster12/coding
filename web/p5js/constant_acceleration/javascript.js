
/*
s = new Suvat(
	s=null,
	u=new Vector(-4,2),
	v=new Vector(3,2),
	a=null
	t=3
)
*/


class Suvat {
  constructor(s, u, v, a, t) {
    this.values = {
      "s": s,
      "u": u,
      "v": v,
      "a": a,
      "t": t
    };
  }


  solve() {
    let s = this.values.s;
    let u = this.values.u;
    let v = this.values.v;
    let a = this.values.a;
    let t = this.values.t;


    if (s == null) { // Need s
      if (u==null) { // No u
        this.values.s = new Vector(
          v.x*t - 0.5*a.x*t*t,
          v.y*t - 0.5*a.y*t*t
        );
      } else if (v==null) { // No v
        this.values.s = new Vector(
          u.x*t + 0.5*a.x*t*t,
          u.y*t + 0.5*a.y*t*t
        );
      } else if (a==null) { // No a
        this.values.s = new Vector(
          0.5*(u.x+v.x)*t,
          0.5*(u.y+v.y)*t
        );
      } else { // No t or otherwise
        this.values.s = new Vector(
          (v.x*v.x - u.x*u.x) / (2 * a.x),
          (v.y*v.y - u.y*u.y) / (2 * a.y)
        );
      }
    }


    if (u == null) { // Need u
      if (s==null) { // No s
        this.values.u = new Vector(
          v.x - a.x*t,
          v.y - a.y*t
        );
      } else if (v==null) { // No v
        this.values.u = new Vector(
          (s.x - 0.5*a.x*t*t) / t,
          (s.y - 0.5*a.y*t*t) / t
        );
      } else if (a==null) { // No a
        this.values.u = new Vector(
          2*s.x/t - v.x,
          2*s.y/t - v.y
        );
      } else { // No t or otherwise
        this.values.u = new Vector(
          sqrt(v.x*v.x - 2*a.x*s.x),
          sqrt(v.y*v.y - 2*a.y*s.y)
        );
      }
    }


    if (v == null) { // Need v
      if (s==null) { // No s
        this.values.v = new Vector(
          v.x = u.x + a.x*t,
          v.y = u.y + a.y*t
        );
      } else if (u==null) { // No u
        this.values.v = new Vector(
          (s.x + 0.5*a.x*t*t)/t,
          (s.y + 0.5*a.y*t*t)/t
        );
      } else if (a==null) { // No a
        this.values.v = new Vector(
          2*s.x/t - u.x,
          2*s.y/t - u.y
        );
      } else { // No t or otherwise
        this.values.v = new Vector(
          sqrt(u.x*u.x + 2*a.x*s.x),
          sqrt(u.y*u.y + 2*a.y*s.y)
        );
      }
    }


    if (a == null) { // Need a
      if (s==null) { // No s
        this.values.a = new Vector(
          (v.x - u.x) / t,
          (v.y - u.y) / t
        );
      } else if (u==null) { // No u
        this.values.a = new Vector(
          (s.x - v.x*t) / (-0.5*t*t),
          (s.y - v.y*t) / (-0.5*t*t)
        );
      } else if (v==null) { // No v
        this.values.a = new Vector(
          (s.x - u.x*t) / (-0.5*t*t),
          (s.y - u.y*t) / (-0.5*t*t)
        );
      } else { // No t or otherwise
        this.values.a = new Vector(
          (v.x*v.x - u.x*u.x) / (2*s.x),
          (v.y*v.y - u.y*u.y) / (2*s.y)
        );
      }
    }


    if (t == null) { // Need t
      if (s==null) { // No s
        this.values.t = new Vector(
          (v.x - u.x) / a.x,
          (v.y - u.y) / a.y
        );
      } else if (u==null) { // No u
        this.values.t = new Vector(
          t.x = (v.x + sqrt(v.x*v.x + 2*a.x*s.x)) / a.x,
          t.y = (v.y + sqrt(v.y*v.y + 2*a.y*s.y)) / a.y
        );
      } else if (v==null) { // No v
        this.values.t = new Vector(
          t.x = (u.x + sqrt(u.x*u.x - 2*a.x*s.x)) / a.x,
          t.y = (u.y + sqrt(u.y*u.y - 2*a.y*s.y)) / a.y
        );
      } else { // No a or otherwise
        this.values.t = new Vector(
          2*s.x / (u.x + v.x),
          2*s.y / (u.y + v.y)
        );
      }
    }
  }
}


class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }


  getMag() {
    return sqrt(this.x*this.x + this.y*this.y);
  }
}
