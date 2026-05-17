import slide1 from './slides/slide1.html?raw'
import slide2 from './slides/slide2.html?raw'
import slide3 from './slides/slide3.html?raw'
import slide4 from './slides/slide4.html?raw'
import slide5 from './slides/slide5.html?raw'
import slide6 from './slides/slide6.html?raw'

const wrapper = document.querySelector('.horizontal-wrapper')
if (wrapper) {
  wrapper.innerHTML = [slide1, slide2, slide3, slide4, slide5, slide6].join('')
}
