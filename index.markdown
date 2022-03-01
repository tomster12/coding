---
layout: default
---

<body>
  <h1>Javascript Notable</h1>
  <ul>
    <li><a href="{{ site.baseurl | escape }}/Javascript/P5js/[..]Algorithms/Ants/index.html">
        Ants
    </a></li>
    <li><a href="{{ site.baseurl | escape }}/Javascript/P5js/[..]Algorithms/Boids2D/index.html">
        Boids
    </a></li>
    <li><a href="{{ site.baseurl | escape }}/Javascript/P5js/[..]Algorithms/Cave Generation/index.html">
        Cave Generation
    </a></li>
    <li><a href="{{ site.baseurl | escape }}/Javascript/P5js/[..]Algorithms/Dungeon Generation/index.html">
        Dungeon Generation
    </a></li>
    <li><a href="{{ site.baseurl | escape }}/Javascript/P5js/[..]Algorithms/Pathfinding Visualization/index.html">
        Pathfinding Visualization
    </a></li>
    <li><a href="{{ site.baseurl | escape }}/Javascript/P5js/[..]Games/Gates Attempt 3/index.html">
        Gates
    </a></li>
  </ul>

  <h1>Javascript Index</h1>
  <ul>
    {% for url in site.static_files %}
      {% if url.path contains ".html" %}
	    	<li><a href="{{ site.baseurl | escape }}{{ url.path | escape }}">
            {{ url.path | escape }}
        </a></li>
      {% endif %}
    {% endfor %}
  </ul>
</body>
