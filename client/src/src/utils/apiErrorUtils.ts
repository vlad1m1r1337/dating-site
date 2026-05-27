const FIELD_ERROR_MESSAGES: Record<string, string> = {
    gender: 'Please select your gender',
    orientation: 'Please select your orientation',
    geoloc: 'Please set your location',
    images: 'Please add at least one photo',
    bio: 'Please add a bio',
    tags: 'Please select at least one tag',
    firstName: 'Please enter your first name',
    lastName: 'Please enter your last name',
    email: 'Please enter a valid email',
    username: 'Please enter your username',
    password: 'Please enter your password',
    content: 'Please enter a message',
    message: 'Please enter a message',
}

const parseKeysFromListMessage = (message: string): string[] | null => {
    const match = message.match(/^(Empty|Missing|Wrong type) key\(s\):/)
    if (!match) {
        return null
    }
    const keys = [...message.matchAll(/'([^']+)'/g)].map(([, key]) => key)
    return keys.length ? keys : null
}

const joinMessages = (messages: string[]): string => {
    if (messages.length === 1) {
        return messages[0]
    }
    if (messages.length === 2) {
        return `${messages[0]} and ${messages[1].charAt(0).toLowerCase()}${messages[1].slice(1)}`
    }
    const last = messages[messages.length - 1]
    const rest = messages.slice(0, -1)
    return `${rest.join(', ')}, and ${last.charAt(0).toLowerCase()}${last.slice(1)}`
}

export const humanizeApiError = (message: string): string => {
    if (message === 'Empty key(s)') {
        return 'Please fill in all required fields'
    }

    const keys = parseKeysFromListMessage(message)
    if (!keys) {
        return message
    }

    if (message.startsWith('Wrong type key(s):')) {
        const labels = keys.map((key) => FIELD_ERROR_MESSAGES[key] || `check the "${key}" field`)
        return joinMessages(labels)
    }

    const labels = keys.map((key) => FIELD_ERROR_MESSAGES[key] || `fill in "${key}"`)
    return joinMessages(labels)
}
