import { LessonSource, RhythmStyle } from './rhythm-types';

const lesson = (title: string, url: string): LessonSource => ({ title, url, language: 'vi' });
const overview = lesson(
  'GuitarShare · 15 điệu đệm hát',
  'https://guitarshare.vn/guitar-blog/tong-hop-15-ieu-em-hat-moi-bai-hat-html/',
);
const technique = lesson(
  'Yamaha Việt Nam · Fingerstyle',
  'https://vn.yamaha.com/vi/news/2020/hoc-guitar-fingerstyle.html',
);

/** References explain the style; the catalog contains our own one-bar practice arrangements. */
export const RHYTHM_STYLES: readonly RhythmStyle[] = [
  {
    id: 'essentials',
    name: 'Essentials',
    summary: 'Build an even pulse before adding syncopation or percussion.',
    tip: 'Relax your wrist and count out loud. Repeat a single bar until every note feels even.',
    sources: [technique, overview],
  },
  {
    id: 'pop',
    name: 'Pop',
    summary: 'Straight grooves with offbeat lifts and spaces for a vocal melody.',
    tip: 'Keep the pulse steady through the gaps. Start softly and use a fuller touch for a chorus.',
    sources: [
      lesson(
        'GuitarShare · Quạt chả Ballad / Slow Surf 4/4',
        'https://guitarshare.vn/guitar-blog/quat-cha-ballad-slow-surf-nhip-44-html/',
      ),
    ],
  },
  {
    id: 'ballad',
    name: 'Ballad / Slow Surf',
    summary: 'Gentle accompaniment with ringing notes, broken chords, and a spacious verse feel.',
    tip: 'Let pitched notes overlap naturally. Give the melody room instead of striking every note loudly.',
    sources: [
      lesson(
        'Trung Nguyên · Rải và quạt Ballad',
        'https://trungnguyenpiano.com/blog/tu-van-mua-dan/cach-danh-dieu-ballad-guitar-31054',
      ),
      overview,
    ],
  },
  {
    id: 'slow-rock',
    name: 'Slow Rock',
    summary: 'A lilting six-eighth-note bar, grouped 1-2-3 / 4-5-6. Feel two larger pulses.',
    tip: 'Lean gently on counts 1 and 4. Keep the two groups of three equal; do not turn this into 3/4.',
    sources: [
      lesson(
        'GuitarShare · Hướng dẫn điệu Slow Rock',
        'https://guitarshare.vn/guitar-blog/dieu-slow-rock/',
      ),
      lesson(
        'Guitar Tiến Quyết · Slow Rock',
        'https://tqguitar.wordpress.com/dieu-slow-rock-day-guitar-ha-noi-bac-ninh/',
      ),
    ],
  },
  {
    id: 'funk',
    name: 'Funk',
    summary:
      'Sixteenth-note motion, short chord stabs, and muted ghost strokes. Fingerpicking versions adapt that rhythm to bass and treble.',
    tip: 'Keep moving through 1-e-&-a. X is a quiet muted brush or tap, never a ringing chord.',
    sources: [
      lesson(
        'Nhạc Cụ Online · Guitar Funk Rock và groove',
        'https://nhaccuonline.com/huong-dan-hoc-guitar-funk-rock/',
      ),
    ],
  },
  {
    id: 'rock',
    name: 'Rock',
    summary:
      'A firm straight pulse, contrasting bass notes and treble hits. These are acoustic practice adaptations.',
    tip: 'Use small movements. Keep the bass controlled and make beats 2 and 4 stand out without rushing.',
    sources: [
      lesson(
        'Nhạc Cụ Online · Guitar Funk Rock',
        'https://nhaccuonline.com/huong-dan-hoc-guitar-funk-rock/',
      ),
      technique,
    ],
  },
  {
    id: 'disco',
    name: 'Disco',
    summary: 'A steady dance pulse with bright offbeats and clipped backbeat sounds.',
    tip: 'Keep the muted strokes short. Release fretting pressure without lifting the fingers far from the strings.',
    sources: [
      lesson(
        'Trung Nguyên · Cách đánh điệu Disco',
        'https://trungnguyenpiano.com/blog/kien-thuc-am-nhac/cach-danh-dieu-disco-31088',
      ),
    ],
  },
  {
    id: 'reggae',
    name: 'Reggae',
    summary:
      'Short treble chords on the offbeats. Fingerpicking exercises separate the bass from those treble stabs.',
    tip: 'Keep the chord hits short. Count the silent downbeats just as carefully as the offbeat notes.',
    sources: [
      lesson(
        'Việt Thương · Chơi Reggae bằng guitar',
        'https://vietthuong.edu.vn/huong-dan-cach-choi-reggae-bang-guitar.html',
      ),
    ],
  },
  {
    id: 'bolero',
    name: 'Bolero',
    summary:
      'Slow bass-led accompaniment with small treble answers. These straight-grid exercises introduce the texture, not every traditional timing nuance.',
    tip: 'Keep the bass warm and the upper notes light. Practice the bass-to-treble phrasing slowly before adding ornaments.',
    sources: [
      lesson(
        'GuitarShare · Điệu Bolero cơ bản',
        'https://guitarshare.vn/guitar-blog/huong-dan-choi-dieu-bolero/',
      ),
      lesson(
        'Học Đàn Ghi Ta · Boston, Rumba, Bolero',
        'https://hocdanghita.net/3-huong-dan-dem-cac-dieu-guitar-boston-rumba-bolero/',
      ),
    ],
  },
  {
    id: 'rumba',
    name: 'Rumba',
    summary:
      'Bass-and-chord exchanges with syncopated treble responses, in the Vietnamese acoustic accompaniment tradition.',
    tip: 'Separate the low bass sound from the bright chord answer. Keep a relaxed, dancing pulse.',
    sources: [
      lesson(
        'Học Đàn Ghi Ta · Các biến thể Rumba',
        'https://hocdanghita.net/3-huong-dan-dem-cac-dieu-guitar-boston-rumba-bolero/',
      ),
      overview,
    ],
  },
  {
    id: 'bossa-nova',
    name: 'Bossa Nova',
    summary:
      'Independent bass notes under syncopated chord plucks. C major keeps the exercise simple; explore seventh chords later.',
    tip: 'Keep the bass even and the treble quiet. These one-bar studies prepare the texture; complete bossa phrases often span two bars.',
    sources: [
      lesson(
        'GuitarShare · Cách chơi Bossa Nova',
        'https://guitarshare.vn/guitar-blog/cach-choi-dieu-bossa-nova/',
      ),
    ],
  },
  {
    id: 'waltz',
    name: 'Waltz',
    summary: 'Three quarter-note beats with the weight on beat 1: ONE-two-three.',
    tip: 'Feel three beats, not two groups of three. Keep beats 2 and 3 lighter than the first.',
    sources: [
      lesson(
        'Việt Thương · Valse và các điệu phổ biến',
        'https://vietthuong.edu.vn/cac-dieu-dan-guitar-pho-bien-va-cach-danh.html',
      ),
      overview,
    ],
  },
  {
    id: 'boston',
    name: 'Boston',
    summary:
      'A gentle slow-waltz texture. Both 3/4 and 6/8 treatments are included; each example shows its written meter.',
    tip: 'Let the upper notes ring. Follow the meter printed on the pattern rather than treating every six-note phrase alike.',
    sources: [
      lesson(
        'Học Đàn Ghi Ta · Boston',
        'https://hocdanghita.net/3-huong-dan-dem-cac-dieu-guitar-boston-rumba-bolero/',
      ),
      overview,
    ],
  },
  {
    id: 'country',
    name: 'Country / Folk',
    summary: 'A regular thumb or bass pulse with treble notes woven between it.',
    tip: 'Practice the bass alone, then add the treble. Over C major, the D-string bass is E, the chord’s third, not an alternating fifth.',
    sources: [
      lesson('Nhạc Cụ Online · Guitar Country', 'https://nhaccuonline.com/?p=29818'),
      {
        title: 'Fender · Travis picking',
        url: 'https://www.fender.com/articles/techniques/travis-picking-on-guitar',
        language: 'en',
      },
    ],
  },
  {
    id: 'blues',
    name: 'Blues / Shuffle',
    summary:
      'A 12/8 triplet grid shows the long-short shuffle clearly. These chordal studies are not a complete 12-bar progression.',
    tip: 'Count 1-la-li, 2-la-li, 3-la-li, 4-la-li. Leave the middle triplet space empty for the long-short shuffle.',
    sources: [
      overview,
      lesson(
        'Việt Thương · Blues và Swing',
        'https://vietthuong.edu.vn/cac-dieu-dan-guitar-pho-bien-va-cach-danh.html',
      ),
    ],
  },
  {
    id: 'cha-cha',
    name: 'Cha-cha-cha',
    summary: 'A lively bass-and-chord rhythm with short, springy treble responses.',
    tip: 'Keep the bass clear and the chord answers crisp. Add the faster closing notes without speeding up the bar.',
    sources: [
      lesson(
        'Trung Nguyên · Guitar Cha Cha Cha',
        'https://trungnguyenpiano.com/blog/kien-thuc-am-nhac/cach-dan-guitar-dieu-cha-cha-cha-31087',
      ),
    ],
  },
];

export function getRhythmStyle(id: RhythmStyle['id']): RhythmStyle {
  return RHYTHM_STYLES.find((style) => style.id === id)!;
}
