(function(factory) {
    typeof define === 'function' && define.amd ? define(factory) : factory();
})(function() {
    'use strict';

    function _typeof(obj) {
        if (typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol') {
            _typeof = function(obj) {
                return typeof obj;
            };
        } else {
            _typeof = function(obj) {
                return obj &&
                    typeof Symbol === 'function' &&
                    obj.constructor === Symbol &&
                    obj !== Symbol.prototype
                    ? 'symbol'
                    : typeof obj;
            };
        }

        return _typeof(obj);
    }

    /**
     * @this {Promise}
     */
    function finallyConstructor(callback) {
        var constructor = this.constructor;
        return this.then(
            function(value) {
                return constructor.resolve(callback()).then(function() {
                    return value;
                });
            },
            function(reason) {
                return constructor.resolve(callback()).then(function() {
                    return constructor.reject(reason);
                });
            }
        );
    }

    // other code modifying setTimeout (like sinon.useFakeTimers())

    var setTimeoutFunc = setTimeout;

    function noop() {} // Polyfill for Function.prototype.bind

    function bind(fn, thisArg) {
        return function() {
            fn.apply(thisArg, arguments);
        };
    }
    /**
     * @constructor
     * @param {Function} fn
     */

    function Promise$1(fn) {
        if (!(this instanceof Promise$1))
            throw new TypeError('Promises must be constructed via new');
        if (typeof fn !== 'function') throw new TypeError('not a function');
        /** @type {!number} */

        this._state = 0;
        /** @type {!boolean} */

        this._handled = false;
        /** @type {Promise|undefined} */

        this._value = undefined;
        /** @type {!Array<!Function>} */

        this._deferreds = [];
        doResolve(fn, this);
    }

    function handle(self, deferred) {
        while (self._state === 3) {
            self = self._value;
        }

        if (self._state === 0) {
            self._deferreds.push(deferred);

            return;
        }

        self._handled = true;

        Promise$1._immediateFn(function() {
            var cb = self._state === 1 ? deferred.onFulfilled : deferred.onRejected;

            if (cb === null) {
                (self._state === 1 ? resolve : reject)(deferred.promise, self._value);
                return;
            }

            var ret;

            try {
                ret = cb(self._value);
            } catch (e) {
                reject(deferred.promise, e);
                return;
            }

            resolve(deferred.promise, ret);
        });
    }

    function resolve(self, newValue) {
        try {
            // Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
            if (newValue === self) throw new TypeError('A promise cannot be resolved with itself.');

            if (newValue && (_typeof(newValue) === 'object' || typeof newValue === 'function')) {
                var then = newValue.then;

                if (newValue instanceof Promise$1) {
                    self._state = 3;
                    self._value = newValue;
                    finale(self);
                    return;
                } else if (typeof then === 'function') {
                    doResolve(bind(then, newValue), self);
                    return;
                }
            }

            self._state = 1;
            self._value = newValue;
            finale(self);
        } catch (e) {
            reject(self, e);
        }
    }

    function reject(self, newValue) {
        self._state = 2;
        self._value = newValue;
        finale(self);
    }

    function finale(self) {
        if (self._state === 2 && self._deferreds.length === 0) {
            Promise$1._immediateFn(function() {
                if (!self._handled) {
                    Promise$1._unhandledRejectionFn(self._value);
                }
            });
        }

        for (var i = 0, len = self._deferreds.length; i < len; i++) {
            handle(self, self._deferreds[i]);
        }

        self._deferreds = null;
    }
    /**
     * @constructor
     */

    function Handler(onFulfilled, onRejected, promise) {
        this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
        this.onRejected = typeof onRejected === 'function' ? onRejected : null;
        this.promise = promise;
    }
    /**
     * Take a potentially misbehaving resolver function and make sure
     * onFulfilled and onRejected are only called once.
     *
     * Makes no guarantees about asynchrony.
     */

    function doResolve(fn, self) {
        var done = false;

        try {
            fn(
                function(value) {
                    if (done) return;
                    done = true;
                    resolve(self, value);
                },
                function(reason) {
                    if (done) return;
                    done = true;
                    reject(self, reason);
                }
            );
        } catch (ex) {
            if (done) return;
            done = true;
            reject(self, ex);
        }
    }

    Promise$1.prototype['catch'] = function(onRejected) {
        return this.then(null, onRejected);
    };

    Promise$1.prototype.then = function(onFulfilled, onRejected) {
        // @ts-ignore
        var prom = new this.constructor(noop);
        handle(this, new Handler(onFulfilled, onRejected, prom));
        return prom;
    };

    Promise$1.prototype['finally'] = finallyConstructor;

    Promise$1.all = function(arr) {
        return new Promise$1(function(resolve, reject) {
            if (!arr || typeof arr.length === 'undefined')
                throw new TypeError('Promise.all accepts an array');
            var args = Array.prototype.slice.call(arr);
            if (args.length === 0) return resolve([]);
            var remaining = args.length;

            function res(i, val) {
                try {
                    if (val && (_typeof(val) === 'object' || typeof val === 'function')) {
                        var then = val.then;

                        if (typeof then === 'function') {
                            then.call(
                                val,
                                function(val) {
                                    res(i, val);
                                },
                                reject
                            );
                            return;
                        }
                    }

                    args[i] = val;

                    if (--remaining === 0) {
                        resolve(args);
                    }
                } catch (ex) {
                    reject(ex);
                }
            }

            for (var i = 0; i < args.length; i++) {
                res(i, args[i]);
            }
        });
    };

    Promise$1.resolve = function(value) {
        if (value && _typeof(value) === 'object' && value.constructor === Promise$1) {
            return value;
        }

        return new Promise$1(function(resolve) {
            resolve(value);
        });
    };

    Promise$1.reject = function(value) {
        return new Promise$1(function(resolve, reject) {
            reject(value);
        });
    };

    Promise$1.race = function(values) {
        return new Promise$1(function(resolve, reject) {
            for (var i = 0, len = values.length; i < len; i++) {
                values[i].then(resolve, reject);
            }
        });
    }; // Use polyfill for setImmediate for performance gains

    Promise$1._immediateFn =
        (typeof setImmediate === 'function' &&
            function(fn) {
                setImmediate(fn);
            }) ||
        function(fn) {
            setTimeoutFunc(fn, 0);
        };

    Promise$1._unhandledRejectionFn = function _unhandledRejectionFn(err) {
        if (typeof console !== 'undefined' && console) {
            console.warn('Possible Unhandled Promise Rejection:', err); // eslint-disable-line no-console
        }
    };

    /** @suppress {undefinedVars} */

    var globalNS = (function() {
        // the only reliable means to get the global object is
        // `Function('return this')()`
        // However, this causes CSP violations in Chrome apps.
        if (typeof self !== 'undefined') {
            return self;
        }

        if (typeof window !== 'undefined') {
            return window;
        }

        if (typeof global !== 'undefined') {
            return global;
        }

        throw new Error('unable to locate global object');
    })();

    if (!('Promise' in globalNS)) {
        globalNS['Promise'] = Promise$1;
    } else if (!globalNS.Promise.prototype['finally']) {
        globalNS.Promise.prototype['finally'] = finallyConstructor;
    }

    var support = {
        searchParams: 'URLSearchParams' in self,
        iterable: 'Symbol' in self && 'iterator' in Symbol,
        blob:
            'FileReader' in self &&
            'Blob' in self &&
            (function() {
                try {
                    new Blob();
                    return true;
                } catch (e) {
                    return false;
                }
            })(),
        formData: 'FormData' in self,
        arrayBuffer: 'ArrayBuffer' in self
    };

    function isDataView(obj) {
        return obj && DataView.prototype.isPrototypeOf(obj);
    }

    if (support.arrayBuffer) {
        var viewClasses = [
            '[object Int8Array]',
            '[object Uint8Array]',
            '[object Uint8ClampedArray]',
            '[object Int16Array]',
            '[object Uint16Array]',
            '[object Int32Array]',
            '[object Uint32Array]',
            '[object Float32Array]',
            '[object Float64Array]'
        ];

        var isArrayBufferView =
            ArrayBuffer.isView ||
            function(obj) {
                return obj && viewClasses.indexOf(Object.prototype.toString.call(obj)) > -1;
            };
    }

    function normalizeName(name) {
        if (typeof name !== 'string') {
            name = String(name);
        }

        if (/[^a-z0-9\-#$%&'*+.^_`|~]/i.test(name)) {
            throw new TypeError('Invalid character in header field name');
        }

        return name.toLowerCase();
    }

    function normalizeValue(value) {
        if (typeof value !== 'string') {
            value = String(value);
        }

        return value;
    } // Build a destructive iterator for the value list

    function iteratorFor(items) {
        var iterator = {
            next: function next() {
                var value = items.shift();
                return {
                    done: value === undefined,
                    value: value
                };
            }
        };

        if (support.iterable) {
            iterator[Symbol.iterator] = function() {
                return iterator;
            };
        }

        return iterator;
    }

    function Headers(headers) {
        this.map = {};

        if (headers instanceof Headers) {
            headers.forEach(function(value, name) {
                this.append(name, value);
            }, this);
        } else if (Array.isArray(headers)) {
            headers.forEach(function(header) {
                this.append(header[0], header[1]);
            }, this);
        } else if (headers) {
            Object.getOwnPropertyNames(headers).forEach(function(name) {
                this.append(name, headers[name]);
            }, this);
        }
    }

    Headers.prototype.append = function(name, value) {
        name = normalizeName(name);
        value = normalizeValue(value);
        var oldValue = this.map[name];
        this.map[name] = oldValue ? oldValue + ', ' + value : value;
    };

    Headers.prototype['delete'] = function(name) {
        delete this.map[normalizeName(name)];
    };

    Headers.prototype.get = function(name) {
        name = normalizeName(name);
        return this.has(name) ? this.map[name] : null;
    };

    Headers.prototype.has = function(name) {
        return this.map.hasOwnProperty(normalizeName(name));
    };

    Headers.prototype.set = function(name, value) {
        this.map[normalizeName(name)] = normalizeValue(value);
    };

    Headers.prototype.forEach = function(callback, thisArg) {
        for (var name in this.map) {
            if (this.map.hasOwnProperty(name)) {
                callback.call(thisArg, this.map[name], name, this);
            }
        }
    };

    Headers.prototype.keys = function() {
        var items = [];
        this.forEach(function(value, name) {
            items.push(name);
        });
        return iteratorFor(items);
    };

    Headers.prototype.values = function() {
        var items = [];
        this.forEach(function(value) {
            items.push(value);
        });
        return iteratorFor(items);
    };

    Headers.prototype.entries = function() {
        var items = [];
        this.forEach(function(value, name) {
            items.push([name, value]);
        });
        return iteratorFor(items);
    };

    if (support.iterable) {
        Headers.prototype[Symbol.iterator] = Headers.prototype.entries;
    }

    function consumed(body) {
        if (body.bodyUsed) {
            return Promise.reject(new TypeError('Already read'));
        }

        body.bodyUsed = true;
    }

    function fileReaderReady(reader) {
        return new Promise(function(resolve, reject) {
            reader.onload = function() {
                resolve(reader.result);
            };

            reader.onerror = function() {
                reject(reader.error);
            };
        });
    }

    function readBlobAsArrayBuffer(blob) {
        var reader = new FileReader();
        var promise = fileReaderReady(reader);
        reader.readAsArrayBuffer(blob);
        return promise;
    }

    function readBlobAsText(blob) {
        var reader = new FileReader();
        var promise = fileReaderReady(reader);
        reader.readAsText(blob);
        return promise;
    }

    function readArrayBufferAsText(buf) {
        var view = new Uint8Array(buf);
        var chars = new Array(view.length);

        for (var i = 0; i < view.length; i++) {
            chars[i] = String.fromCharCode(view[i]);
        }

        return chars.join('');
    }

    function bufferClone(buf) {
        if (buf.slice) {
            return buf.slice(0);
        } else {
            var view = new Uint8Array(buf.byteLength);
            view.set(new Uint8Array(buf));
            return view.buffer;
        }
    }

    function Body() {
        this.bodyUsed = false;

        this._initBody = function(body) {
            this._bodyInit = body;

            if (!body) {
                this._bodyText = '';
            } else if (typeof body === 'string') {
                this._bodyText = body;
            } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
                this._bodyBlob = body;
            } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
                this._bodyFormData = body;
            } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
                this._bodyText = body.toString();
            } else if (support.arrayBuffer && support.blob && isDataView(body)) {
                this._bodyArrayBuffer = bufferClone(body.buffer); // IE 10-11 can't handle a DataView body.

                this._bodyInit = new Blob([this._bodyArrayBuffer]);
            } else if (
                support.arrayBuffer &&
                (ArrayBuffer.prototype.isPrototypeOf(body) || isArrayBufferView(body))
            ) {
                this._bodyArrayBuffer = bufferClone(body);
            } else {
                this._bodyText = body = Object.prototype.toString.call(body);
            }

            if (!this.headers.get('content-type')) {
                if (typeof body === 'string') {
                    this.headers.set('content-type', 'text/plain;charset=UTF-8');
                } else if (this._bodyBlob && this._bodyBlob.type) {
                    this.headers.set('content-type', this._bodyBlob.type);
                } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
                    this.headers.set(
                        'content-type',
                        'application/x-www-form-urlencoded;charset=UTF-8'
                    );
                }
            }
        };

        if (support.blob) {
            this.blob = function() {
                var rejected = consumed(this);

                if (rejected) {
                    return rejected;
                }

                if (this._bodyBlob) {
                    return Promise.resolve(this._bodyBlob);
                } else if (this._bodyArrayBuffer) {
                    return Promise.resolve(new Blob([this._bodyArrayBuffer]));
                } else if (this._bodyFormData) {
                    throw new Error('could not read FormData body as blob');
                } else {
                    return Promise.resolve(new Blob([this._bodyText]));
                }
            };

            this.arrayBuffer = function() {
                if (this._bodyArrayBuffer) {
                    return consumed(this) || Promise.resolve(this._bodyArrayBuffer);
                } else {
                    return this.blob().then(readBlobAsArrayBuffer);
                }
            };
        }

        this.text = function() {
            var rejected = consumed(this);

            if (rejected) {
                return rejected;
            }

            if (this._bodyBlob) {
                return readBlobAsText(this._bodyBlob);
            } else if (this._bodyArrayBuffer) {
                return Promise.resolve(readArrayBufferAsText(this._bodyArrayBuffer));
            } else if (this._bodyFormData) {
                throw new Error('could not read FormData body as text');
            } else {
                return Promise.resolve(this._bodyText);
            }
        };

        if (support.formData) {
            this.formData = function() {
                return this.text().then(decode);
            };
        }

        this.json = function() {
            return this.text().then(JSON.parse);
        };

        return this;
    } // HTTP methods whose capitalization should be normalized

    var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT'];

    function normalizeMethod(method) {
        var upcased = method.toUpperCase();
        return methods.indexOf(upcased) > -1 ? upcased : method;
    }

    function Request(input, options) {
        options = options || {};
        var body = options.body;

        if (input instanceof Request) {
            if (input.bodyUsed) {
                throw new TypeError('Already read');
            }

            this.url = input.url;
            this.credentials = input.credentials;

            if (!options.headers) {
                this.headers = new Headers(input.headers);
            }

            this.method = input.method;
            this.mode = input.mode;
            this.signal = input.signal;

            if (!body && input._bodyInit != null) {
                body = input._bodyInit;
                input.bodyUsed = true;
            }
        } else {
            this.url = String(input);
        }

        this.credentials = options.credentials || this.credentials || 'same-origin';

        if (options.headers || !this.headers) {
            this.headers = new Headers(options.headers);
        }

        this.method = normalizeMethod(options.method || this.method || 'GET');
        this.mode = options.mode || this.mode || null;
        this.signal = options.signal || this.signal;
        this.referrer = null;

        if ((this.method === 'GET' || this.method === 'HEAD') && body) {
            throw new TypeError('Body not allowed for GET or HEAD requests');
        }

        this._initBody(body);
    }

    Request.prototype.clone = function() {
        return new Request(this, {
            body: this._bodyInit
        });
    };

    function decode(body) {
        var form = new FormData();
        body.trim()
            .split('&')
            .forEach(function(bytes) {
                if (bytes) {
                    var split = bytes.split('=');
                    var name = split.shift().replace(/\+/g, ' ');
                    var value = split.join('=').replace(/\+/g, ' ');
                    form.append(decodeURIComponent(name), decodeURIComponent(value));
                }
            });
        return form;
    }

    function parseHeaders(rawHeaders) {
        var headers = new Headers(); // Replace instances of \r\n and \n followed by at least one space or horizontal tab with a space
        // https://tools.ietf.org/html/rfc7230#section-3.2

        var preProcessedHeaders = rawHeaders.replace(/\r?\n[\t ]+/g, ' ');
        preProcessedHeaders.split(/\r?\n/).forEach(function(line) {
            var parts = line.split(':');
            var key = parts.shift().trim();

            if (key) {
                var value = parts.join(':').trim();
                headers.append(key, value);
            }
        });
        return headers;
    }

    Body.call(Request.prototype);
    function Response(bodyInit, options) {
        if (!options) {
            options = {};
        }

        this.type = 'default';
        this.status = options.status === undefined ? 200 : options.status;
        this.ok = this.status >= 200 && this.status < 300;
        this.statusText = 'statusText' in options ? options.statusText : 'OK';
        this.headers = new Headers(options.headers);
        this.url = options.url || '';

        this._initBody(bodyInit);
    }
    Body.call(Response.prototype);

    Response.prototype.clone = function() {
        return new Response(this._bodyInit, {
            status: this.status,
            statusText: this.statusText,
            headers: new Headers(this.headers),
            url: this.url
        });
    };

    Response.error = function() {
        var response = new Response(null, {
            status: 0,
            statusText: ''
        });
        response.type = 'error';
        return response;
    };

    var redirectStatuses = [301, 302, 303, 307, 308];

    Response.redirect = function(url, status) {
        if (redirectStatuses.indexOf(status) === -1) {
            throw new RangeError('Invalid status code');
        }

        return new Response(null, {
            status: status,
            headers: {
                location: url
            }
        });
    };

    var DOMException = self.DOMException;

    try {
        new DOMException();
    } catch (err) {
        DOMException = function DOMException(message, name) {
            this.message = message;
            this.name = name;
            var error = Error(message);
            this.stack = error.stack;
        };

        DOMException.prototype = Object.create(Error.prototype);
        DOMException.prototype.constructor = DOMException;
    }

    function fetch$1(input, init) {
        return new Promise(function(resolve, reject) {
            var request = new Request(input, init);

            if (request.signal && request.signal.aborted) {
                return reject(new DOMException('Aborted', 'AbortError'));
            }

            var xhr = new XMLHttpRequest();

            function abortXhr() {
                xhr.abort();
            }

            xhr.onload = function() {
                var options = {
                    status: xhr.status,
                    statusText: xhr.statusText,
                    headers: parseHeaders(xhr.getAllResponseHeaders() || '')
                };
                options.url =
                    'responseURL' in xhr ? xhr.responseURL : options.headers.get('X-Request-URL');
                var body = 'response' in xhr ? xhr.response : xhr.responseText;
                resolve(new Response(body, options));
            };

            xhr.onerror = function() {
                reject(new TypeError('Network request failed'));
            };

            xhr.ontimeout = function() {
                reject(new TypeError('Network request failed'));
            };

            xhr.onabort = function() {
                reject(new DOMException('Aborted', 'AbortError'));
            };

            xhr.open(request.method, request.url, true);

            if (request.credentials === 'include') {
                xhr.withCredentials = true;
            } else if (request.credentials === 'omit') {
                xhr.withCredentials = false;
            }

            if ('responseType' in xhr && support.blob) {
                xhr.responseType = 'blob';
            }

            request.headers.forEach(function(value, name) {
                xhr.setRequestHeader(name, value);
            });

            if (request.signal) {
                request.signal.addEventListener('abort', abortXhr);

                xhr.onreadystatechange = function() {
                    // DONE (success or failure)
                    if (xhr.readyState === 4) {
                        request.signal.removeEventListener('abort', abortXhr);
                    }
                };
            }

            xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit);
        });
    }
    fetch$1.polyfill = true;

    if (!self.fetch) {
        self.fetch = fetch$1;
        self.Headers = Headers;
        self.Request = Request;
        self.Response = Response;
    }

    function publications() {
        fetch(
            'https://raw.githubusercontent.com/RhoInc/publication-library/master/data/publicationMetadata.json'
        )
            .then(function(response) {
                return response.json();
            })
            .then(function(json) {
                buildPubList(json, '.publications');
            });

        function buildPubList(meta, parentElement) {
            var parentDiv = d3.select(parentElement);
            var list = parentDiv.append('ul').attr('class', 'pubs');
            var items = list
                .selectAll('li')
                .data(meta.slice(0, 3)) // get latest three publications
                .enter()
                .append('li')
                .attr('class', 'pub'); //thumb

            items.append('img').attr('src', function(d) {
                return (
                    'https://raw.githubusercontent.com/RhoInc/publication-library/master/img/' +
                    d.thumbnail
                );
            }); //    .text(d => (d.description ? d.description : "<no description available>"));

            var wraps = items.append('div').attr('class', 'pub-wrap'); //title

            wraps
                .append('p')
                .attr('class', 'title')
                .text(function(d) {
                    return d.title;
                }); //description

            wraps
                .append('p')
                .attr('class', 'reference')
                .text(function(d) {
                    return d.reference;
                }); //author

            wraps
                .append('p')
                .attr('class', 'author')
                .text(function(d) {
                    return d.authors;
                }); //tags

            function cap1(string) {
                return string.charAt(0).toUpperCase() + string.slice(1);
            }

            var taglist = wraps.append('ul').attr('class', 'tags');
            taglist
                .selectAll('li')
                .data(function(d) {
                    return d.links;
                })
                .enter()
                .append('li')
                .append('a')
                .attr('href', function(d) {
                    return d.href.indexOf('http') > -1
                        ? d.href
                        : 'https://rhoinc.github.io/publication-library/pubs/' + d.href;
                })
                .attr('class', function(d) {
                    return d.type;
                })
                .html(function(d) {
                    return d.type == 'github' ? d.type : cap1(d.type);
                });
            parentDiv
                .append('p')
                .html(
                    '<a target = "_blank" href = "https://rhoinc.github.io/publication-library/">View all ' +
                        meta.length +
                        ' publications</a>'
                );
        }
    }

    function releases() {
        var selection = d3.select('.releases');
        var converter = new showdown.Converter(); // converts markdown to html

        fetch('data/releases.json')
            .then(function(response) {
                return response.json();
            })
            .then(function(json) {
                //Capture latest releases.
                var latestReleases = Object.keys(json)
                    .map(function(key) {
                        return json[key];
                    })
                    .filter(function(releases) {
                        return releases.length > 0;
                    })
                    .map(function(releases) {
                        releases.forEach(function(release) {
                            release.date = new Date(release.created_at);
                            release.repo = release.url.split('/')[5];
                            release.repo_url = 'https://github.com/RhoInc/' + release.repo;
                            release.html = converter.makeHtml(release.body);
                        });
                        return releases.sort(function(a, b) {
                            return b.date.getTime() - a.date.getTime();
                        })[0]; // get latest release
                    })
                    .sort(function(a, b) {
                        return b.date.getTime() - a.date.getTime();
                    });
                var numShown = 5;
                selection
                    .selectAll('div.release')
                    .data(latestReleases)
                    .enter()
                    .append('div')
                    .classed('hidden', function(d, i) {
                        return i >= numShown;
                    })
                    .classed('release', true)
                    .each(function(d) {
                        var release = d3.select(this);
                        release.append('h5').html(
                            "<a href='"
                                .concat(
                                    d.html_url,
                                    '\'><i class="fa fa-tag" aria-hidden="true"></i> '
                                )
                                .concat(d.name, "</a> of <a href='")
                                .concat(d.repo_url, "'>")
                                .concat(d.repo, '</a> released on ')
                                .concat(d.created_at.substring(0, 10))
                        );
                        release
                            .append('span')
                            .classed('release__body', true)
                            .html(d.html);
                    });
                selection
                    .append('p')
                    .append('a')
                    .html('Show 5 more releases')
                    .style('text-decoration', 'underline')
                    .style('cursor', 'pointer')
                    .on('click', function() {
                        numShown = numShown + 5;
                        selection.selectAll('div.release').classed('hidden', function(d, i) {
                            return i >= numShown;
                        });
                    });
            });
    }

    function md2html(text) {
        var converter = new showdown.Converter();
        var dashes = false;
        var title;
        var author;
        var split = text
            .split('\n')
            .map(function(line) {
                return line.replace(
                    /\{\{ site\.baseurl \}\}/g,
                    'https://raw.githubusercontent.com/RhoInc/blog/master/'
                );
            })
            .filter(function(line) {
                if (/^---\s*$/.test(line)) {
                    dashes = !dashes;
                    return false;
                }

                if (dashes && /^\s*title\s*:\s*/.test(line))
                    title = line.replace(/\s*title\s*:\s*/, '');
                if (dashes && /^\s*author\s*:\s*/.test(line))
                    author = line.replace(/\s*author\s*:\s*/, '');
                return !dashes;
            });
        split.unshift('### '.concat(title));
        split.push('_Written by '.concat(author, ' on [date]_'));
        var html = converter.makeHtml(split.join('\n'));
        return html;
    }

    function blogPosts() {
        fetch('./data/blogPosts.json')
            .then(function(response) {
                return response.json();
            })
            .then(function(json) {
                var latestBlogPost = json.sort(function(a, b) {
                    return a.name < b.name ? 1 : -1;
                })[0];
                var html = md2html(latestBlogPost.md).replace(
                    '[date]',
                    latestBlogPost.name.substring(0, 10)
                );
                var blogPost = d3.select('.blog-post');
                blogPost
                    .append('div')
                    .classed('blog-post__innards', true)
                    .html(html);
                blogPost
                    .append('p')
                    .html(
                        "<a target = '_blank' href = 'https://rhoinc.github.io/blog/'>View all blog posts</a>"
                    );
            });
    }

    publications();
    releases();
    blogPosts();
});
