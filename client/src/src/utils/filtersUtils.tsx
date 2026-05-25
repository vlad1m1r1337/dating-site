import _ from 'lodash'

export const defaultFilterParams = {
    minAge: 18,
    maxAge: 99,
    minElo: 20,
    maxElo: 1000,
    distance: 1000,
    minTags: 1,
}

export const checkFilterParams = (
    setAgeSliderValue: (value: number[]) => void,
    setEloSliderValue: (value: number[]) => void,
    setDistanceSliderValue: (value: number) => void,
    setMinTagsSliderValue: (value: number) => void,
    maxCommonTags: number = 20,
) => {
    if (localStorage.getItem("filterParams")) {
        try {
            const filterParams = JSON.parse(localStorage.getItem("filterParams") || "")

            const filterParamsKeys = Object.keys(filterParams)
            const defaultFilterParamsKeys = Object.keys(defaultFilterParams)

            const isLegacyDefaultFilterParams =
                filterParams.minAge === 18 &&
                filterParams.maxAge === 99 &&
                filterParams.minElo === 20 &&
                filterParams.maxElo === 1000 &&
                filterParams.distance === 50 &&
                filterParams.minTags === 1

            if (isLegacyDefaultFilterParams) {
                localStorage.setItem("filterParams", JSON.stringify(defaultFilterParams))
                setAgeSliderValue([defaultFilterParams.minAge, defaultFilterParams.maxAge])
                setEloSliderValue([defaultFilterParams.minElo, defaultFilterParams.maxElo])
                setDistanceSliderValue(defaultFilterParams.distance)
                setMinTagsSliderValue(defaultFilterParams.minTags)
                return
            }

            if (_.isEqual(filterParamsKeys, defaultFilterParamsKeys) && filterParamsKeys.every((key) => typeof filterParams[key] === 'number')) {
                if (filterParams.minAge < 18 || filterParams.minAge > 99 || filterParams.maxAge < 18 || filterParams.maxAge > 99 || filterParams.minAge > filterParams.maxAge)
                    localStorage.setItem("filterParams", JSON.stringify(defaultFilterParams))
                else if (filterParams.minElo < 0 || filterParams.minElo > 1000 || filterParams.maxElo < 0 || filterParams.maxElo > 1000 || filterParams.minElo > filterParams.maxElo)
                    localStorage.setItem("filterParams", JSON.stringify(defaultFilterParams))
                else if (filterParams.distance < 1 || filterParams.distance > 1000)
                    localStorage.setItem("filterParams", JSON.stringify(defaultFilterParams))
                else if (filterParams.minTags < 0 || filterParams.minTags > maxCommonTags) {
                    filterParams.minTags = maxCommonTags
                    localStorage.setItem("filterParams", JSON.stringify(filterParams))
                }
                else {
                    setAgeSliderValue([filterParams.minAge, filterParams.maxAge])
                    setEloSliderValue([filterParams.minElo, filterParams.maxElo])
                    setDistanceSliderValue(filterParams.distance)
                    setMinTagsSliderValue(Math.min(filterParams.minTags, maxCommonTags))
                }
            }
            else {
                localStorage.setItem("filterParams", JSON.stringify(defaultFilterParams))
            }

        }
        catch {
            localStorage.setItem("filterParams", JSON.stringify(defaultFilterParams))
        }
    }
    else {
        localStorage.setItem("filterParams", JSON.stringify(defaultFilterParams))
    }

}