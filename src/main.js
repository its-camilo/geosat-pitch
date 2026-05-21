import onePagerHtml from './one-pager.html?raw'
import './style.css'

const root = document.getElementById('geosat-one-pager')
if (root) {
  root.innerHTML = onePagerHtml
}
