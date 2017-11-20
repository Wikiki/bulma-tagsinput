class Tagify {
  constructor(element, options = {}) {
    let defaultOptions = {
      disabled: false,
      delimiter: ',',
      allowDelete: true,
      lowercase: false,
      uppercase: false,
      duplicates: true
    }
    this.element = element;
    this.options = Object.assign({}, defaultOptions, options);

    this.init();
  }

  init() {
    if (!this.options.disabled) {
      this.tags = [];
      this.container = document.createElement('div');
      this.container.className = 'tagsinput';
      this.container.classList.add('field');
      this.container.classList.add('is-grouped');
      this.container.classList.add('is-grouped-multiline');
      this.container.classList.add('input');

      let inputType = this.element.getAttribute('type');
    	if (!inputType || inputType === 'tags') {
    		inputType = 'text';
      }
      this.input = document.createElement('input');
      this.input.setAttribute('type', inputType);
      this.container.appendChild(this.input);

      let sib = this.element.nextSibling;
      this.element.parentNode[sib ? 'insertBefore':'appendChild'](this.container, sib);
      this.element.style.cssText = 'position:absolute;left:0;top:0;width:1px;height:1px;opacity:0.01;';
      this.element.tabIndex = -1;

      this.enable();
    }
  }

  enable() {
    if (!this.enabled && !this.options.disabled) {

      this.element.addEventListener('focus', () => {
        this.container.classList.add('focus');
        this.select();
      });

      this.input.addEventListener('focus', () => {
    		this.container.classList.add('focus');
    		this.select();
      });
      this.input.addEventListener('blur', () => {
    		this.container.classList.remove('focus');
    		this.select();
    		this.savePartial();
      });
      this.input.addEventListener('keydown', (e) => {
        let key = e.keyCode || e.which,
          selectedTag,
          activeTag = this.container.querySelector('.is-active'),
          last = (Array.prototype.slice.call(this.container.querySelectorAll('.tag'))).pop(),
          atStart = this.caretAtStart(e);

        if (activeTag) {
          selectedTag = this.container.querySelector('[data-tag="' + activeTag.innerHTML + '"]');
        }
        this.setInputWidth();

        if (key === 13 || key === this.options.delimiter.charCodeAt(0) || key === 9) {
          if (!this.input.value && key !== this.options.delimiter.charCodeAt(0)) {
            return;
          }
          this.savePartial();
        } else if (key === 46 && selectedTag) {
    			if (selectedTag.nextSibling !== this.input) {
            this.select(selectedTag.nextSibling);
          }
    			this.container.removeChild(selectedTag);
          delete this.tags[this.tags.indexOf(selectedTag.getAttribute('data-tag'))];
    			this.setInputWidth();
    			this.save();
        } else if (key === 8) {
          if (selectedTag) {
    				this.select(selectedTag.previousSibling);
    				this.container.removeChild(selectedTag);
            delete this.tags[this.tags.indexOf(selectedTag.getAttribute('data-tag'))];
    				this.setInputWidth();
    				this.save();
    			}
    			else if (last && atStart) {
    				this.select(last);
    			}
    			else {
    				return;
          }
        } else if (key === 37) {
    			if (selectedTag) {
    				if (selectedTag.previousSibling) {
    					select(selectedTag.previousSibling);
    				}
    			} else if (!atStart) {
    				return;
    			} else {
    				this.select(last);
    			}
    		}
    		else if (key === 39) {
    			if (!selectedTag) {
            return;
          }
    			this.select(selectedTag.nextSibling);
    		}
    		else {
    			return this.select();
        }

        e.preventDefault();
        return false;
      });
      this.input.addEventListener('input', () => {
        this.element.value = this.getValue();
        this.element.dispatchEvent(new Event('input'));
      });
      this.input.addEventListener('paste', () => setTimeout(savePartial, 0));

      this.container.addEventListener('mousedown', (e) => { this.refocus(e); });
      this.container.addEventListener('touchstart', (e) => { this.refocus(e); });

      this.savePartial(this.element.value);

      this.enabled = true;
    }
  }

  disable() {
    if (this.enabled && !this.options.disabled) {
      this.reset();

      this.enabled = false;
    }
  }

  select(el) {
		let sel = this.container.querySelector('.is-active');
		if (sel) {
      sel.classList.remove('is-active');
    }
		if (el) {
      el.classList.add('is-active');
    }
  }

  addTag(text) {
    if (~text.indexOf(this.options.delimiter)) {
      text = text.split(this.options.delimiter);
    }
    if (Array.isArray(text)) {
      return text.forEach((text) => {
        this.addTag(text)
      });
    }

    let tag = text && text.trim();
    if (!tag) {
      return false;
    }

    if (this.element.getAttribute('lowercase') || this.options['lowercase'] == 'true') {
      tag = tag.toLowerCase();
    }
    if (this.element.getAttribute('uppercase') || this.options['uppercase'] == 'true') {
      tag = tag.toUpperCase();
    }
    if (this.element.getAttribute('duplicates') == 'true' || this.options['duplicates'] || this.tags.indexOf(tag) === -1) {
      this.tags.push(tag);

      let newTagWrapper = document.createElement('div');
      newTagWrapper.className = 'control';
      newTagWrapper.setAttribute('data-tag', tag);

      let newTag = document.createElement('div');
      newTag.className = 'tags';
      newTag.classList.add('has-addons');

      let newTagContent = document.createElement('span');
      newTagContent.className = 'tag';
      newTagContent.innerHTML = tag;

      newTag.appendChild(newTagContent);
      if (this.options.allowDelete) {
        let newTagDeleteButton = document.createElement('a');
        newTagDeleteButton.className = 'tag';
        newTagDeleteButton.classList.add('is-delete');
        newTagDeleteButton.addEventListener('click', (e) => {
          let selectedTag,
            activeTag = e.target.parentNode,
            last = (Array.prototype.slice.call(this.container.querySelectorAll('.tag'))).pop(),
            atStart = this.caretAtStart(e);

          if (activeTag) {
            selectedTag = this.container.querySelector('[data-tag="' + activeTag.innerText + '"]');
          }

          if (selectedTag) {
    				this.select(selectedTag.previousSibling);
    				this.container.removeChild(selectedTag);
            delete this.tags[this.tags.indexOf(selectedTag.getAttribute('data-tag'))];
    				this.setInputWidth();
    				this.save();
    			}
    			else if (last && atStart) {
    				this.select(last);
    			}
    			else {
    				return;
          }
        });
        newTag.appendChild(newTagDeleteButton);
      }
      newTagWrapper.appendChild(newTag);

      this.container.insertBefore( newTagWrapper, this.input);
    }
  }

  getValue() {
    return this.tags.join(this.options.delimiter);
  }

  setValue(value) {
    (Array.prototype.slice.call(this.container.querySelectorAll('.tag'))).forEach((tag) => {
      delete this.tags[this.tags.indexOf(tag.innerHTML)];
      this.container.removeChild(tag);
    });
    this.savePartial(value);
  }

  setInputWidth() {
    let last = (Array.prototype.slice.call(this.container.querySelectorAll('.control'))).pop();

    if (!this.container.offsetWidth) {
      return;
    }
    this.input.style.width = Math.max(this.container.offsetWidth - (last ? (last.offsetLeft + last.offsetWidth) : 30) - 30, this.container.offsetWidth / 4) + 'px';
  }

  savePartial(value) {
    if (typeof value !== 'string' && !Array.isArray(value)) {
      value = this.input.value;
    }
    if (this.addTag(value) !== false) {
			this.input.value = '';
			this.save();
			this.setInputWidth();
    }
  }

  save() {
    this.element.value = this.tags.join(this.options.delimiter);
    this.element.dispatchEvent(new Event('change'));
  }

  caretAtStart(el) {
		try {
			return el.selectionStart === 0 && el.selectionEnd === 0;
		}
		catch(e) {
			return el.value === '';
		}
  }

  refocus(e) {
		if (e.target.classList.contains('tag')) {
      this.select(e.target);
    }
		if (e.target === this.input) {
      return this.select();
    }
		this.input.focus();
		e.preventDefault();
		return false;
  }

  reset() {
    this.tags = [];
  }

  destroy() {
    this.disable();
    this.reset();
    this.element = null;
  }
}

let tagInputs = document.querySelectorAll('input[type="tags"]');
if (tagInputs) {
  tagInputs.forEach(element => {
    new Tagify(element);
  })
}
