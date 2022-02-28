---
layout: default
---

<body>
  <h1>Javascript</h1>
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
