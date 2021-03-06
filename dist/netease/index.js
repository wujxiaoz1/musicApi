"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _util = require("../util");

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

const top_list_all = {
  "0": ["云音乐新歌榜", "3779629"],
  "1": ["云音乐热歌榜", "3778678"],
  "2": ["网易原创歌曲榜", "2884035"],
  "3": ["云音乐飙升榜", "19723756"],
  "4": ["云音乐电音榜", "10520166"],
  "5": ["UK排行榜周榜", "180106"],
  "6": ["美国Billboard周榜", "60198"],
  "7": ["KTV嗨榜", "21845217"],
  "8": ["iTunes榜", "11641012"],
  "9": ["Hit FM Top榜", "120001"],
  "10": ["日本Oricon周榜", "60131"],
  "11": ["韩国Melon排行榜周榜", "3733003"],
  "12": ["韩国Mnet排行榜周榜", "60255"],
  "13": ["韩国Melon原声周榜", "46772709"],
  "14": ["中国TOP排行榜(港台榜)", "112504"],
  "15": ["中国TOP排行榜(内地榜)", "64016"],
  "16": ["香港电台中文歌曲龙虎榜", "10169002"],
  "17": ["华语金曲榜", "4395559"],
  "18": ["中国嘻哈榜", "1899724"],
  "19": ["法国 NRJ EuroHot 30周榜", "27135204"],
  "20": ["台湾Hito排行榜", "112463"],
  "21": ["Beatport全球电子舞曲榜", "3812895"]
};

function _default(instance) {
  const getMusicInfo = (info, privilege) => {
    if (!privilege) {
      privilege = info.privilege;
    }

    return {
      album: {
        id: info.al.id,
        name: info.al.name,
        cover: info.al.picUrl
      },
      artists: info.ar.map(ar => {
        return {
          id: ar.id,
          name: ar.name
        };
      }),
      name: info.name,
      id: info.id,
      cp: !privilege.cp,
      dl: !privilege.fee
    };
  };

  return {
    instance,

    searchSong({
      keyword,
      limit = 30,
      offset = 0,
      type = 1
    }) {
      return _asyncToGenerator(function* () {
        // *(type)* 搜索单曲(1)，歌手(100)，专辑(10)，歌单(1000)，用户(1002)
        const params = {
          csrf_token: '',
          limit,
          type,
          s: keyword,
          offset
        };

        try {
          let _ref = yield instance.post('/weapi/cloudsearch/get/web', params),
              result = _ref.result;

          if (!result) {
            result = {
              songCount: 0,
              songs: []
            };
          }

          return {
            status: true,
            data: {
              total: result.songCount,
              songs: result.songs.map(item => getMusicInfo(item))
            }
          };
        } catch (e) {
          console.warn(e);
          return {
            status: false,
            msg: '获取失败',
            log: e
          };
        }
      })();
    },

    getSongDetail(id) {
      return _asyncToGenerator(function* () {
        try {
          let data = yield instance.post('/weapi/v3/song/detail', {
            c: JSON.stringify([{
              id: id
            }]),
            ids: '[' + id + ']',
            csrf_token: ''
          });
          const info = data.songs[0];

          if (!info) {
            return {
              status: false,
              msg: _util.noSongsDetailMsg
            };
          }

          return {
            status: true,
            data: getMusicInfo(info, data.privileges[0])
          };
        } catch (e) {
          return {
            status: false,
            msg: '请求失败',
            log: e
          };
        }
      })();
    },

    getBatchSongDetail(ids) {
      return _asyncToGenerator(function* () {
        ids = ids.map(item => parseInt(item));

        try {
          let data = yield instance.post('/weapi/v3/song/detail', {
            c: JSON.stringify(ids.map(item => ({
              id: item
            }))),
            ids: JSON.stringify(ids),
            csrf_token: ''
          });
          const privilegeObject = {};
          data.privileges.forEach(item => {
            privilegeObject[item.id] = item;
          });
          return {
            status: true,
            data: data.songs.map(info => getMusicInfo(info, privilegeObject[info.id]))
          };
        } catch (e) {
          return {
            status: false,
            msg: '请求失败',
            log: e
          };
        }
      })();
    },

    getSongUrl(id) {
      return _asyncToGenerator(function* () {
        return {
          status: true,
          data: {
            url: `http://music.163.com/song/media/outer/url?id=${id}.mp3`
          }
        };
        const params = {
          ids: [id],
          br: 999000,
          csrf_token: ''
        };

        try {
          let _ref2 = yield instance.post('/weapi/song/enhance/player/url', params),
              data = _ref2.data;
        } catch (e) {
          return {
            status: false,
            msg: '获取失败',
            log: e
          };
        }
      })();
    },

    getLyric(id) {
      return _asyncToGenerator(function* () {
        try {
          let data = yield instance.post('/weapi/song/lyric?os=osx&id=' + id + '&lv=-1&kv=-1&tv=-1', {});

          if (data.lrc && data.lrc.lyric) {
            const translateDecodeData = (0, _util.lyric_decode)(data.tlyric.lyric) || [];
            const translate = [];

            for (let i = 0; i < translateDecodeData.length - 1; i++) {
              if (translateDecodeData[i][1] !== translateDecodeData[i + 1][1]) {
                translate.push(translateDecodeData[i]);
              }
            }

            if (translateDecodeData.length) {
              translate.push(translateDecodeData.pop());
            }

            return {
              status: true,
              data: {
                lyric: (0, _util.lyric_decode)(data.lrc.lyric),
                translate
              }
            };
          } else {
            return {
              status: true,
              data: {
                lyric: [],
                translate: []
              }
            };
          }
        } catch (e) {
          return {
            status: false,
            msg: '请求失败',
            log: e
          };
        }
      })();
    },

    getTopList(id) {
      return _asyncToGenerator(function* () {
        try {
          const _ref3 = yield instance.post('/weapi/v3/playlist/detail', {
            id: top_list_all[id][1],
            limit: 30,
            offset: 0,
            total: true,
            n: 1000,
            csrf_token: ""
          }),
                playlist = _ref3.playlist,
                privileges = _ref3.privileges;

          return {
            status: true,
            data: {
              name: playlist.name,
              description: playlist.description,
              cover: playlist.coverImgUrl,
              playCount: playlist.playCount,
              list: playlist.tracks.map((item, i) => getMusicInfo(item, privileges[i]))
            }
          };
        } catch (e) {
          return {
            status: false,
            msg: '获取失败',
            log: e
          };
        }
      })();
    },

    getComment(rid, page, limit = 20) {
      return _asyncToGenerator(function* () {
        try {
          let _ref4 = yield instance.post('/weapi/v1/resource/comments/R_SO_4_' + rid + '/?csrf_token=', {
            offset: (page - 1) * limit,
            rid,
            limit,
            csrf_token: ""
          }),
              hotComments = _ref4.hotComments,
              comments = _ref4.comments,
              total = _ref4.total;

          return {
            status: true,
            data: {
              hotComments: hotComments || [],
              comments: comments || [],
              total
            }
          };
        } catch (e) {
          return {
            status: false,
            msg: '请求失败',
            log: e
          };
        }
      })();
    },

    getArtistSongs(id, offset, limit) {
      return _asyncToGenerator(function* () {
        try {
          let data = yield instance.post(`/weapi/v1/artist/${id}`, {
            csrf_token: '',
            offset,
            limit
          });
          return {
            status: true,
            data: {
              detail: {
                id,
                name: data.artist.name,
                avatar: data.artist.img1v1Url,
                desc: data.artist.briefDesc
              },
              songs: data.hotSongs.map(item => getMusicInfo(item))
            }
          };
        } catch (e) {
          return {
            status: false,
            msg: '请求失败',
            log: e
          };
        }
      })();
    },

    getAlbumSongs(id, offset, limit) {
      return _asyncToGenerator(function* () {
        try {
          const _ref5 = yield instance.post(`/weapi/v3/playlist/detail`, {
            id,
            n: limit,
            s: 8,
            csrf_token: ""
          }),
                playlist = _ref5.playlist,
                privileges = _ref5.privileges;

          const privilegesObjects = {};
          privileges.forEach(item => {
            privilegesObjects[item.id] = item;
          });
          return {
            status: true,
            data: {
              detail: {
                id: playlist.id,
                name: playlist.name,
                cover: playlist.coverImgUrl,
                desc: playlist.description
              },
              songs: playlist.tracks.map(item => getMusicInfo(item, privilegesObjects[item.id]))
            }
          };
        } catch (e) {
          return {
            status: false,
            msg: '请求失败',
            log: e
          };
        }
      })();
    },

    getAlbumDetail(id) {
      return _asyncToGenerator(function* () {
        try {
          const _ref6 = yield instance.post(`/weapi/v1/album/${id}`, {}),
                album = _ref6.album,
                songs = _ref6.songs;

          return {
            status: true,
            data: {
              name: album.name,
              cover: album.picUrl,
              artist: {
                id: album.artist.id,
                name: album.artist.name
              },
              desc: album.description,
              publishTime: album.publishTime,
              songs: songs.map(item => getMusicInfo(item))
            }
          };
        } catch (e) {
          return {
            status: false,
            msg: '请求失败',
            log: e
          };
        }
      })();
    },

    getBanner() {
      return _asyncToGenerator(function* () {
        try {
          const _ref7 = yield instance.get('http://music.163.com/discover', {}, {
            headers: {
              Referer: "http://music.163.com",
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3380.0 Safari/537.36"
            },
            pureFly: true
          }),
                data = _ref7.data;

          const pattern = /<script[^>]*>\s*window\.Gbanners\s*=\s*([^;]+?);\s*<\/script>/g;
          const banners = pattern.exec(data)[1];
          return {
            status: true,
            data: eval(banners)
          };
        } catch (e) {
          return {
            status: false,
            msg: '请求失败',
            log: e
          };
        }
      })();
    },

    getMvDetail(id) {
      return _asyncToGenerator(function* () {
        try {
          const _ref8 = yield instance.post(`/weapi/mv/detail`, {
            id
          }),
                data = _ref8.data;

          return {
            status: true,
            data
          };
        } catch (e) {
          return {
            status: false,
            msg: '请求失败',
            log: e
          };
        }
      })();
    },

    getMvComment(id, page = 1, limit = 20) {
      return _asyncToGenerator(function* () {
        try {
          const data = yield instance.post(`/weapi/v1/resource/comments/R_MV_5_${id}/?csrf_token=`, {
            offset: (page - 1) * limit,
            rid: id,
            limit,
            csrf_token: ""
          });
          return {
            status: true,
            data: {
              total: data.total || 0,
              hotComments: data.hotComments || [],
              comments: data.comments || []
            }
          };
        } catch (e) {
          return {
            status: false,
            msg: '请求失败',
            log: e
          };
        }
      })();
    },

    getTopPlaylist(cat = '全部', page = 1, limit = 20) {
      return _asyncToGenerator(function* () {
        try {
          const data = yield instance.post(`/weapi/playlist/highquality/list`, {
            cat,
            offset: (page - 1) * limit,
            limit,
            csrf_token: ''
          });
          return {
            status: true,
            data: data.playlists
          };
        } catch (e) {
          return {
            status: false,
            msg: '请求失败',
            log: e
          };
        }
      })();
    }

  };
}