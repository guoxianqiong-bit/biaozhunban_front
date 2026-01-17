<template>
	<view>
		
	</view>
</template>

<script>
	export default {
		name:"handle_bluetooth",
		data() {
			return {
				flag:true,
				firstFlag:true,
				headerAdded:false,
				inputText: 'SEND_BEGIN',
				isConnected: false,
				SAMPLE_RATE : 16000, // 采样率
				BITS_PER_SAMPLE : 16, // 采样位数
				timerId:'',
				startTimeTamp:'',
				endTimeTamp:'',
				reportId:1,
				
				
				deviceId: 'asdasacascas',
				
				BLEInformation:{
					serviceId:'',
					charaterId:''
				}
			};
		},
		
		onLoad(){
			uni.openBluetoothAdapter({
				success(res) {
					console.log('初始化蓝牙成功')
					console.log(res)
				},
				fail(err) {
					console.log('初始化蓝牙失败')
					console.error(err)
				}
			})
			
			uni.createBLEConnection({
			  // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
			  deviceId:this.deviceId,
			  // 连接成功
			  success(res) {
			    console.log("已与设备蓝牙连接成功")
				uni.showToast({
				  title: '连接成功',
				  icon: 'success',
				  duration: 1000
				})
				this.isConnected = true
				this.establishConnection()
			  }
			  // 连接失败
			  fail(res){
				console.log("蓝牙设备连接失败")
				uni.showToast({
				  title: '连接失败',
				  icon: 'fail',
				  duration: 1000
				})
			  }
			})
		},
		
		methods:{
			
			
			// 与蓝牙设备发送数据前建立连接
			establishConnection(){
				this.getBlueServices();
				console.log("进入recive方法->监听蓝牙设备发送的数据")
			},
			
			// 获取服务列表
			getBlueServices(){
				uni.getBLEDeviceServices({
				  // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
				  deviceId:this.deviceId,
				  success(res) {
					// 拿到serviceId
					this.BLEInformation.serviceId = res.services[0].uuid
					// 获取charaterId
					this.getCharacteristics()
				  }
				})
			},
			
			// 获取蓝牙设备某个服务中支持notify 或者 indicate的特征值
			getCharacteristics() {
			    uni.getBLEDeviceCharacteristics({
			      deviceId: this.deviceId,
			      serviceId: this.BLEInformation.serviceId,
			      success: function (res) {
			        console.log('进入getCharacteristics方法',res.characteristics)
					
					// var properties = res.characteristics[0].properties
					this.BLEInformation.charaterId = res.characteristics[0].uuid
			        this.monitorCharacteristicValueChange();
			      }
			    })
			},
			
			// 监听蓝牙设备发送的数据
			monitorCharacteristicValueChange() {
			    console.log('蓝牙基本信息：',this.deviceId,this.BLEInformation.serviceId,this.BLEInformation.charaterId)
			    uni.notifyBLECharacteristicValueChange({
			      state: true,
			      deviceId: this.deviceId,
			      serviceId: this.BLEInformation.serviceId,
			      characteristicId: this.BLEInformation.charaterId,
			      success: function (res) {
			        console.log('启用notify成功')
			        console.log('notifyBLECharacteristicValueChange success', res.errMsg);
			      },
			      fail: function (res) {
			        console.log(res)
			        console.log('启用notify失败')
			      },
			    })
				this.receiveBlueSentData()
			},
			
			// 正式接收蓝牙发送的数据
			receiveBlueSentData(){
				this.setMTU()
				// 监听蓝牙特征值变化
				this.startTimeTamp = new Date().getTime();
				uni.onBLECharacteristicValueChange(function (res) {
				  const receiveData = this.buf2string(res.value);
				  const dataArray = receiveData.split(" ");
				  if(dataArray[0]=="B"){
					console.log("存储bioelectricity数据")
					const restData = dataArray.slice(1).join(" ")+" ";
					this.appendFile('bioelectricity_'+this.startTimeTamp+'.txt',restData)
				  }else if(dataArray[0]=="P"){
					const restData = dataArray.slice(1).join(",");
					console.log("存储position数据")
					this.appendFile('position_'+this.startTimeTamp+'.txt',restData)
				  }else if(dataArray[0]=="S"){
					  console.log("存储snoreSignal数据")
					  if(this.flag){
						this.flag=false;
						this.uploadWavWrapper()
					  }
					  const restData = dataArray.slice(1).join(" ");
					  this.appendFile('snoreSignal.txt',restData)
				  }
				});
			},
			
			// 通知蓝牙设备可以发送数据
			noticeBlueSent(){
				if (this.isConnected) {
				  var buffer = new ArrayBuffer(this.inputText.length)
				  var dataView = new Uint8Array(buffer)
				  for (var i = 0; i < this.inputText.length; i++) {
					dataView[i] = this.inputText.charCodeAt(i)
				  }
			  
				  uni.writeBLECharacteristicValue({
					deviceId: this.deviceId,
					serviceId: this.BLEInformation.serviceId,
					characteristicId: this.BLEInformation.charaterId,
					value: buffer,
					success: function (res) {
					  console.log('通知蓝牙发送数据成功')
					},
					fail: function (res) {
					  console.log(res)
					  console.log('通知蓝牙发送数据失败')
					}
				  })
				} else {
				  uni.showToast({
				    title: '蓝牙已断开',
				    icon: 'fail',
				    duration: 1000
				  })
				}
			}
			
			setMTU(){
				// 设置蓝牙设备 MTU 大小
				const mtu = 512;
				uni.setBLEMTU({
				  deviceId: this.deviceId,
				  mtu,
				  success: (res) => {
					console.log("setBLEMTU success>>", res);
				  },
				  fail: (res) => {
					console.log("setBLEMTU fail>>", res);
				  }
				});
			},
			
			uploadWavWrapper() {
				// 设置定时器，每隔60秒调用一次 uploadWav 函数
				console.log("计时器开始")
				var timerId = setInterval(() => {
					console.log("执行上传操作");
					this.uploadWav();
				}, 5000); // 5秒间隔执行上传操作
				this.timerId=timerId
			},
			
			uploadWav(){
				//读取snoreSignal.txt文件里面的电信号，转化成snore.wav
				uni.getFileSystemManager().readFile({
			    filePath: uni.env.USER_DATA_PATH + '/snoreSignal.txt',
			    encoding: 'utf8',
			    success(res) {
					const signalData = res.data.trim(); // 获取文件内容
					if (signalData) {
					// 解析电信号数据并生成 WAV 文件
					const wavData = this.generateWAVData(signalData);
					console.log("wavData",wavData)
					// 将 WAV 数据写入文件
					this.saveWAVToFile(wavData);
			      } else {
			        console.error('无法解析电信号数据');
			      }
			    },
			    fail(err) {
					console.error('读取文件失败', err);
			    }
			  });
			},
			
			generateWAVData(signalData) {
				Number.prototype.toBytesLE = function (bytes) {
			      const arr = new Uint8Array(bytes);
			      for (let i = 0; i < bytes; i++) {
			        arr[i] = (this >> (i * 8)) & 0xff;
			      }
			      return arr;
			    };
				const signalValues = signalData.split(' ').map(Number); // 将数据拆分成数值数组
				// 计算 WAV 文件数据大小
				const wavSize = signalValues.length * (this.BITS_PER_SAMPLE / 8);
				// 构建 WAV 文件头部
				const header = this.createWAVHeader(wavSize);
				// 将电信号数据转换为二进制 WAV 数据
				const wavData = new Uint8Array(header.length + wavSize);
				wavData.set(header);
				// 将信号数据转换为 PCM 格式的音频数据
				for (let i = 0; i < signalValues.length; i++) {
			    const pcmValue = signalValues[i];
			    const offset = header.length + i * (this.BITS_PER_SAMPLE / 8);
			    if (this.BITS_PER_SAMPLE === 16) {
			      wavData[offset] = pcmValue & 0xff;
			      wavData[offset + 1] = (pcmValue >> 8) & 0xff;
			    }
			    // 可根据需要添加其他位深度的处理
			  }
			  return wavData;
			},
			
			createWAVHeader(dataSize) {
				const headerSize = 44;
				const totalSize = headerSize + dataSize;
				const header = new Uint8Array(headerSize);
			
				// 将数值转换为小端字节序的数组
				Number.prototype.toBytesLE = function (bytes) {
					const arr = new Uint8Array(bytes);
					for (let i = 0; i < bytes; i++) {
					  arr[i] = (this >> (i * 8)) & 0xff;
					}
					return arr;
				};
			
				// RIFF chunk descriptor
				header.set([0x52, 0x49, 0x46, 0x46], 0); // 'RIFF'
				header.set(totalSize.toBytesLE(4), 4); // 文件大小
				header.set([0x57, 0x41, 0x56, 0x45], 8); // 'WAVE'
				// Format chunk
				header.set([0x66, 0x6D, 0x74, 0x20], 12); // 'fmt '
				header.set([0x10, 0x00, 0x00, 0x00], 16); // PCM 头部大小
				header.set([0x01, 0x00], 20); // 音频格式：PCM
				header.set([0x01, 0x00], 22); // 通道数：1
				header.set(this.SAMPLE_RATE.toBytesLE(4), 24); // 采样率
				header.set([(this.SAMPLE_RATE * this.BITS_PER_SAMPLE) / 8, 0x00], 28); // 数据速率
				header.set([(this.BITS_PER_SAMPLE / 8), 0x00], 32); // 数据块对齐
				header.set([this.BITS_PER_SAMPLE, 0x00], 34); // 位深度
				// Data chunk
				header.set([0x64, 0x61, 0x74, 0x61], 36); // 'data'
				header.set(dataSize.toBytesLE(4), 40); // 数据大小
				return header;
			},
			
			// 将 WAV 数据保存到本地文件
			saveWAVToFile(wavData) {
			  // 将 WAV 数据写入本地文件
			  uni.getFileSystemManager().writeFile({
			    filePath: uni.env.USER_DATA_PATH + '/snore.wav',
			    data: wavData.buffer, // 将生成的 WAV 数据写入文件
			    encoding: 'binary', // 设置编码格式为 binary
			    success() {
			      uni.showToast({
			        title: 'WAV 文件保存成功',
			        icon: 'success',
			        duration: 2000
			      });
			       //把snore.wav传接口,返回的系数重新写到snore_that.data.startTimeTamp.txt文件里
			      uni.uploadFile({
			        url: 'http://42.193.14.241:8090/uploadWav',
			        filePath: uni.env.USER_DATA_PATH + '/snore.wav',
			        name: 'file', // 后端接口中接收文件的字段名
			        success(res) {
			            // 解析 JSON 字符串为对象
			            const dataObj = JSON.parse(res.data);
			            // 获取 "mfcc" 字段对应的字符串形式的 JSON 数组
			            const mfccString = dataObj.mfcc+",";
			            // 处理上传成功的逻辑
			            this.appendFile('snore_'+this.startTimeTamp+'.txt',mfccString)
			            //清空原来snore.txt,和snore.wav的文件内容
			            this.clearFileContent('snoreSignal.txt');
			            this.clearFileContent('snore.wav');
			        },
			        fail(err) {
			            console.error('上传失败', err);
			            // 处理上传失败的逻辑
			        }
			    });
			
			    },
			    fail(err) {
			      console.error('WAV 文件保存失败', err);
			    }
			  });
			},
			
			clearFileContent(fileName) {
				// 获取文件系统管理器
				const fileSystemManager = uni.getFileSystemManager();
				// 使用 writeFile 方法写入空字符串以清空文件内容
				fileSystemManager.writeFile({
			    filePath:  uni.env.USER_DATA_PATH+'/'+fileName,
			    data: '',
			    encoding: 'utf8',
			    success(res) {
			      console.log('文件内容已清空');
			    },
			    fail(err) {
			      console.error('清空文件内容失败', err);
			    }
			  });
			},
			
			// 定义保存文件的函数
			appendFile(fileName,dataToSave) {
				const fs = uni.getFileSystemManager(); // 获取文件系统管理器
				const filePath = uni.env.USER_DATA_PATH+'/'+fileName; // 构建文件路径
				  // 判断文件是否存在
					fs.access({
						path: filePath,
						success: () => {
						// 文件存在，直接追加数据
						this.appendDataToFile(filePath,dataToSave);
						},
						fail: () => {
						// 文件不存在，先创建文件再追加数据
						this.createFileAndAppendData(filePath,dataToSave);
					}
				  });
			},
			
			appendDataToFile(filePath,dataToSave){
			    const fs = uni.getFileSystemManager();
			    // 将数据追加到文件末尾
			    fs.appendFile({
			      filePath: filePath,
			      data: dataToSave,
			      encoding: 'utf8',
			      success: (res) => {
			        // console.log(`数据追加成功：${filePath}`);
			        // 可以在成功追加后执行其他操作，如提示用户追加成功
			      },
			      fail: (err) => {
			        console.error(`数据追加失败：`, err);
			        // 追加数据失败时，可以提示用户追加失败
			        uni.showToast({
			          title: '数据追加失败',
			          icon: 'none',
			          duration: 2000
			        });
			      }
			    });
			},
			  
			createFileAndAppendData(filePath, dataToSave) {
			    const fs = uni.getFileSystemManager();
			    fs.writeFile({
					filePath: filePath,
					data: dataToSave,
					encoding: 'utf8',
					success(res) {
					  console.log(`文件创建并数据追加成功：${filePath}`);
					  // 可以在成功创建文件并追加数据后执行其他操作
					},
					fail(err) {
					  console.error(`文件创建失败：`, err);
					  // 创建文件失败时，可以提示用户创建失败
					  uni.showToast({
						title: '文件创建失败',
						icon: 'none',
						duration: 2000
					  });
					}
			    });
			},
			
			buf2string(buffer) {
			    var arr = Array.prototype.map.call(new Uint8Array(buffer), x => x)
			    var str = ''
			    for (var i = 0; i < arr.length; i++) {
			      str += String.fromCharCode(arr[i])
			    }
			    return str
			},
		}
	}
</script>

<style>

</style>