/*
* FileSystemManager by Mike Chambers
*
* Copyright (c) 2012 Mike Chambers
*
* Permission is hereby granted, free of charge, to any person
* obtaining a copy of this software and associated documentation
* files (the "Software"), to deal in the Software without
* restriction, including without limitation the rights to use,
* copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the
* Software is furnished to do so, subject to the following
* conditions:
*
* The above copyright notice and this permission notice shall be
* included in all copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
* EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
* OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
* NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
* HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
* WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
* FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
* OTHER DEALINGS IN THE SOFTWARE.
*/

/**
* The FileSystem Library provides a simple API for interacting with the
* HTML5 FileSystem API.
* @module FileSystem
**/

/*
	TODO:
		-need options for truncate, append, overwrite?
		-add a verbose flag / property that toggles //console.log statements
		-add API to request initial storage
		-add API to request quota
		-add API to read as binary file? (or flag?)
		-maybe make API just for reading / writing text files?

		-rename to FileManager?
		-create namespace for classes?
*/

; (function(exports) {
	'use strict';

		/**
		* The FileSystemManager class provides a simplified interface to the FileSystem API
		* @class FileSystemManager
		* @extends {Object}
		* @constructor
		* @param {String} storageType Type of storage to use. Can be "PERSISTENT" or "TEMPORARY". The constants can be
		* access via window.PERSISTENT and window.TEMPORARY respectively. The default value is "PERSISTENT".
		* @param {Number} The storage size in bytes to request for storage. If the amout of storage is
		* greater than the amount that has been previously approved by the user, the user will be prompted to approve
		* the request for additional storage. The request may be delay until the file system is accessed. Ignored if storageType
		* is set to TEMPORARY.
		**/
		function FileSystemManager(storageType, storageSize) {

			if (storageType) {
				this.storageType = storageType;
			}

			if (storageSize) {
				this.storageSize = storageSize;
			}
		}


		//todo: make this read only
		/**
		* Type of storage to use. Can be "PERSISTENT" or "TEMPORARY". The constants can be
		* accessed via window.PERSISTENT and window.TEMPORARY respectively.
		* @readonly
		* @property storageType
		* @type {Number}
		* @default window.PERSISTENT
		**/
		FileSystemManager.prototype.storageType = window.PERSISTENT;

		/**
		* Constant value that represents 1 MegaByte (1,048,576 Bytes)
		* @readonly
		* @property MB
		* @type {Number}
		* @static
		* @const
		**/
		FileSystemManager.MB = 1024* 1024;//1 meg

		/**
		* The storage size in bytes to request for storage.
		* @readonly
		* @property storageSize
		* @type {String}
		* @default 1 MegaByte (1,048,576 Bytes)
		**/
		FileSystemManager.prototype.storageSize = 1* FileSystemManager.MB;

		/**
		* Contains reference to function for window.requestFileSystem
		* @readonly
		* @property requestFileSystem
		* @type {Function}
		* @static
		* @const
		**/
		FileSystemManager.requestFileSystem = (window.requestFileSystem || window.webkitRequestFileSystem);

		/**
		* Contains reference to Function for window.BlobBuilder constructor
		* @readonly
		* @property blobBuilderClass
		* @type {Function}
		* @static
		* @const
		**/
		FileSystemManager.blobBuilderConstructor = (window.BlobBuilder || window.WebKitBlobBuilder);

		FileSystemManager.storageInfo = (window.storageInfo || window.webkitStorageInfo);

		//todo: make this read only
		/**
		* Reference to FileSystem instance used for file system operations.
		* @readonly
		* @property fileSystem
		* @type {FileSystem}
		**/
		FileSystemManager.prototype.fileSystem = null;

		/**
		*
		* @method getStorageQuota
		* @param {Function} successCallback Function that will be called on sucessful completion of operation.
		* @param {Function} errorCallback Function that will be called if an error occurs during operation.
		* @param {String} storageType Type of storage to query. Possible values include "PERSISTENT" or "TEMPORARY".
		* The constants can be accessed via window.PERSISTENT and window.TEMPORARY respectively.
		**/
		FileSystemManager.getStorageQuota = function(successCallback, errorCallback, storageType) {

			if (storageType === undefined) {
				storageType = this.storageType;
			}

			FileSystemManager.storageInfo.queryUsageAndQuota(
				storageType,
				successCallback,
				errorCallback
			);
		};

		/**
		*
		* @method initFileSystem
		* @param {Function} successCallback Function that will be called on sucessful completion of operation.
		* @param {Function} errorCallback Function that will be called if an error occurs during operation.
		**/
		FileSystemManager.prototype.initFileSystem = function(successCallback, errorCallback) {

			if (this.fileSystem) {
				if (successCallback) {
						successCallback(this.fileSystem);
				}
				return;
			}

			var scope = this;

			var a = FileSystemManager.requestFileSystem;

			/*
				todo:
					if I call FileSystemManager.requestFileSystem()
					directly, we get an illegal innvocation. not sure why.
					if i store in another var first, it works fine
			*/
			a(
				this.storageType,
				this.storageSize,
				function(fs) {
					scope.fileSystem = fs;
					if (successCallback) {
							successCallback(fs);
					}
				},
				function(error) {
					if (errorCallback) {
						errorCallback(error);
					}
				}
			);
		}

		/**
		*
		* @method requestQuota
		* @param {Number} storageInfo
		* @param {Function} successCallback Function that will be called on sucessful completion of operation.
		* @param {Function} errorCallback Function that will be called if an error occurs during operation.
		**/
		FileSystemManager.prototype.requestQuota = function(storageSize, successCallback, errorCallback){

			FileSystemManager.storageInfo.requestQuota(
				window.PERSISTENT,
				storageSize,
				function(grantedBytes){

					//sometimes success callback will be called, but grantedBytes will be
					//0 (which is the same as denied). Need to check for it here.
					//may have a timeout for the user to approve the UI prompt.
					//this seems to occur if the user doesnt respond to the storage prompt
					//in some amount of time
					if(grantedBytes === 0)
					{
						if(errorCallback){
							errorCallback({msg:"Request Quota denied : returned 0"});
						}
						return;
					}

					if(successCallback){
						successCallback(grantedBytes);
					}
				},
				function(error){
					console.log("denied");
					console.log(error);
					if(errorCallback){
						errorCallback(error);
					}
				}
			);
		}

		/**
		*
		* @method writeString
		* @param {String} fileName
		* @param {String} data
		* @param {Function} successCallback Function that will be called on sucessful completion of operation.
		* @param {Function} errorCallback Function that will be called if an error occurs during operation.
		* @param {Boolean} create
		* @param {String} mimeType
		**/
		FileSystemManager.prototype.writeString = function(fileName, data, successCallback, errorCallback, create, mimeType) {

			if (create === undefined) {
				create = true;
			}

			if (!mimeType) {
				mimeType = "text/plain'";
			}

			var scope = this;

			this.initFileSystem(
				function() {
					var errorWritingData = false;
					scope.fileSystem.root.getFile(
						fileName, {
							create: create
						},
						function(fileEntry) {
							fileEntry.createWriter(
								function(fileWriter) {
									fileWriter.onwriteend = function(e) {
										if (!errorWritingData) {
											if (successCallback) {
												successCallback();
											}
										}
									};

									fileWriter.onerror = function(e) {
										errorWritingData = true;
										//console.log("Error 1111 writing file.");

										if (errorCallback) {
											errorCallback(e);
										}
									};

									var bb = new (FileSystemManager.blobBuilderConstructor)();
									bb.append(data);
									fileWriter.write(bb.getBlob(mimeType));
								},
								function(e)
								{
									//console.log("Error 1112 writing file.");
									if (errorCallback) {
										errorCallback(e);
									}
								}
							);
						},
						function(e) {
							//console.log("Error 1113 writing file.");
							if (errorCallback) {
								errorCallback(e);
							}
						}
					);
				},
				function(error) {
					if (errorCallback) {
						return errorCallback(error);
					}
				}
			);

		}

		//todo: currently only reads as text file
		/**
		*
		* @method readString
		* @fileName {String} fileName
		* @param {Function} successCallback Function that will be called on sucessful completion of operation.
		* @param {Function} errorCallback Function that will be called if an error occurs during operation.
		**/
		FileSystemManager.prototype.readString = function(fileName, successCallback, errorCallback) {

			var scope = this;

			this.initFileSystem(
				function() {
					scope.fileSystem.root.getFile(
						fileName, {
						},
						function(fileEntry) {
							// Get a File object representing the file,
							// then use FileReader to read its contents.
							fileEntry.file(
								function(file) {
									var reader = new FileReader();

									reader.onloadend = function(e) {
										if (successCallback) {
											successCallback(this.result);
										}
									};
									reader.readAsText(file);
								},
								function(e) {
									if (errorCallback) {
										errorCallback(e);
									}
								}
							);
						},
						function(e) {
							if (errorCallback) {
								errorCallback(e);
							}
						}
					);
				},
				function(error) {
					if (errorCallback) {
						return errorCallback(error);
					}
				}
			);
		}

		/**
		*
		* @method writeObject
		* @param {String} fileName
		* @param {Object} data
		* @param {Function} successCallback Function that will be called on sucessful completion of operation.
		* @param {Function} errorCallback Function that will be called if an error occurs during operation.
		* @param {Boolean} create
		**/
		FileSystemManager.prototype.writeObject = function(fileName, data, successCallback, errorCallback, create) {

			this.writeString(fileName, JSON.stringify(data), successCallback, errorCallback, create);
		}

		/**
		*
		* @method readObject
		* @param {String} fileName
		* @param {Function} successCallback Function that will be called on sucessful completion of operation.
		* @param {Function} errorCallback Function that will be called if an error occurs during operation.
		* @return {TYPE} TYPE DESCRIPTION.
		**/
		FileSystemManager.prototype.readObject = function(fileName, successCallback, errorCallback) {

			var scope = this;
			this.readString(
				fileName,
				function(data) {

					var d;
					var success = false;
					try {
						d = JSON.parse(data);
						success = true;
					}
					catch (e) {
						console.log('Error 3001 Cannot deserialize data.');

						//data is corrupted. delete it
						scope.deleteFile(
							fileName,
							function() {
								if (errorCallback) {
									errorCallback(e);
								}
							},
							function(error) {
								if (errorCallback) {
									errorCallback(e);
								}
							});
					}

					if (success) {
						if (successCallback) {
							successCallback(d);
						}
					}

				},
				function(error) {
					if (errorCallback) {
						errorCallback(error);
					}
				}
			);
		}

		/**
		*
		* @method deleteFile
		* @param {String} fileName
		* @param {Function} successCallback Function that will be called on sucessful completion of operation.
		* @param {Function} errorCallback Function that will be called if an error occurs during operation.
		* @return {TYPE} TYPE DESCRIPTION.
		**/
		FileSystemManager.prototype.deleteFile = function(fileName, successCallback, errorCallback) {

			var scope = this;
			this.initFileSystem(
				function(fs) {
					fs.root.getFile(
						fileName,
						{create: false},
						function(fileEntry) {
							fileEntry.remove(
								function() {
									if (successCallback) {
										successCallback();
									}
								},
								function(error) {
									if (errorCallback) {
										errorCallback(error);
									}
								}
							);
						},
						function(error) {
							//check if error code is file not found, if so
							//callback success, otherwise, error

							if (error.code === FileError.NOT_FOUND_ERR) {
								if (successCallback) {
									successCallback();
								}

								return;
							}

							if (errorCallback) {
								errorCallback(error);
							}
						}
					);
				},
				function(error) {
					if (errorCallback) {
						return errorCallback(error);
					}
				}
			);
		}

		/**
		*
		* @method getErrorMessage
		* @static
		* @param {FileError} fileError
		* @return {String} String that describes the error code for the specified FileError instance.
		**/
		FileSystemManager.getErrorMessage = function(fileError) {
			var msg = '';

			switch (fileError.code) {
				case FileError.QUOTA_EXCEEDED_ERR:
					msg = 'QUOTA_EXCEEDED_ERR';
					break;
				case FileError.NOT_FOUND_ERR:
					msg = 'NOT_FOUND_ERR';
					break;
				case FileError.SECURITY_ERR:
					msg = 'SECURITY_ERR';
					break;
				case FileError.INVALID_MODIFICATION_ERR:
					msg = 'INVALID_MODIFICATION_ERR';
					break;
				case FileError.INVALID_STATE_ERR:
					msg = 'INVALID_STATE_ERR';
					break;
				default:
					msg = 'Unknown Error';
					break;
			}

			return msg;
		}

		exports.FileSystemManager = FileSystemManager;
}(this));
