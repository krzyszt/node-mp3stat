var fs = require('fs');
var bitrates = { 1:32000, 2:40000, 3:48000, 4:56000, 5:64000, 6:80000, 
                 7:96000, 8:112000, 9:128000, A:160000, B:192000, 
                 C:224000, D:256000, E:320000 };

function buildState(bitrate, size, cb){
   var magnitudes = ['hours', 'minutes', 'seconds', 'miliseconds'],
                     duration ={},
                     stats,
                     hours = (size / (bitrate / 8) / 3600 );
                  
   (function timeProcessor(time, counter){
         var timeArray = [], factor = (counter < 3) ? 60 : 1000;
         if (counter){
            timeArray = (factor * +('0.' + time)).toString().split('.');
         }
         
         if (counter < magnitudes.length -1) {
            duration[magnitudes[counter]] = timeArray[0] || Math.floor(time);
            duration[magnitudes[counter]] = +duration[magnitudes[counter]];
            counter += 1;
            timeProcessor(timeArray[1] || time.toString().split('.')[1], counter);
            return;
         }
         //round off the final magnitude
           duration[magnitudes[counter]] = Math.round(timeArray.join('.'));
   }(hours, 0));
   
   stats = {
      duration: duration,
      bitrate: bitrate,
      filesize: size,
      timestamp: Math.round(hours*3600000),
      timesig: ''
   };
   
   function pad(n){
      return n < 0 ? '0' +n : n; 
   }
   
   magnitudes.forEach(function(mag, i){
      if (i <3 ){
         stats.timesig += pad(duration[mag]) + ( (i < 2) ? ':' : '');
      }
   });
   
   cb(null, stats);
   
};

function findBitRate(f,cb){
   fs.createReadStream(f).on('data', function(data){
      var i;
      for ( i = 0; i < data.length ; i +=2) {
         if (data.readUInt16LE(i) === 64511) {
            this.pause();
            cb(null, bitrates[data.toString('hex', i + 2, i + 3)[0]]);
            break;
         }
      }
   }).on('end', function(){
      cb(new Error('Could not find bitrate, Is this definitely an MPEG-1 MP3?'));
   });
}

exports.stat = function(f,cb){
   fs.stat(f, function(err,fstats){
      findBitRate(f, function(err, bitrate) {
         if (err) {
            cb(err);
            return;
         }
         
         buildState(bitrate, fstats.size, cb);
      });
   });
};