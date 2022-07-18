function punchHolesInArray(array, replaceWith) {
  const occurence = 30;
  const oFuzziness = 10;
  const oMin = ((occurence - oFuzziness) / 100) * array.length;
  const oMax = ((occurence + oFuzziness) / 100) * array.length;

  const sampleScale = 10;
  const sampleSize = (sampleScale / 100) * array.length;
  const sFuzziness = 20;

  const spacingOccurence = 100 - occurence;
  const spaceSize =
    (spacingOccurence / (occurence / sampleScale) / 100) * array.length * 0.9; // arbitrarily reduce spacing to maximize occurrence

  const getRandomSampleSize = () =>
    Math.round(
      getRandom(
        sampleSize - (sFuzziness / 100) * sampleSize,
        sampleSize + (sFuzziness / 100) * sampleSize
      )
    );

  const getRandomSpacing = () =>
    Math.round(
      getRandom(
        spaceSize - (sFuzziness / 100) * spaceSize,
        spaceSize + (sFuzziness / 100) * spaceSize
      )
    );

  // let isLastSectionASample = Math.random() >= 0.5; // Heads or tails
  let isLastSectionASample = true;
  const oLimit = Math.round(getRandom(oMin, oMax));
  let count = 0;
  let i = 0;

  while (count < oLimit && i <= array.length) {
    if (isLastSectionASample) {
      const space = getRandomSpacing();
      const adjustedSpaceSize =
        i + space > array.length ? array.length - i : space;
      i = i + adjustedSpaceSize;
      isLastSectionASample = false;
    } else {
      const sampleSize = getRandomSampleSize();
      let adjustedSampleSize = Math.min(
        i + sampleSize > array.length ? array.length - i : sampleSize,
        oLimit - count
      );

      if (typeof replaceWith === "undefined") {
        const prevItem = array[i - 1];
        const nextItem = array[i + adjustedSampleSize + 1];
        const step = (nextItem - prevItem) / adjustedSampleSize;

        for (let j = i; j < i + adjustedSampleSize; j++) {
          array[j] = prevItem + step * j;
        }
      } else {
        for (let j = i; j < i + adjustedSampleSize; j++) {
          array[j] = replaceWith;
        }
      }

      count += adjustedSampleSize;
      i += adjustedSampleSize;
      isLastSectionASample = true;
    }

    if (count >= array.length || i >= array.length) {
      break;
    }
  }

  return array;
}
