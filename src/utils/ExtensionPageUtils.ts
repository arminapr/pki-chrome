import { iMsgReqType } from '../types/MessageTypes';

export function sendUserActionInfo (
  user_id: string,
  event_number: number,
  reportedSite = '',
  currentSite = '',
) {
  const timestamp = Date.now();

  const eventComments = {
    1: 'Interact with Moby-protected website without opening extension',
    2: 'Open popup on Moby-protected site',
    3: 'Open popup',
    4: 'Site saved as Moby-protected',
    5: 'Site saved as Moby-protected after being saved as unsafe',
    6: 'Site saved as unsafe',
    8: 'Moby-protected site removed',
    9: 'Unsafe site removed',
    11: 'Site Unblocked Temporarily',
  };

  //this is annoying
  let comment =
    eventComments[event_number as keyof typeof eventComments] ||
    'Unknown event';

  // Handling event 10 for reporting phishing
  if (event_number === 10) {
    comment = `Reported phishing on site ${reportedSite} by ${currentSite}`;
  }
  if (event_number === 7) {
    // Special handling for event 7 - save sensitive site info

    chrome.storage.local.get({ websiteList: {} }, function (items) {
      const websiteList = items.websiteList;
      const sensitiveWebsites = [];
      for (const domain in websiteList) {
        if (websiteList[domain].isSensitive) {
          sensitiveWebsites.push(domain);
        }
      }
      const sensitiveListComment =
        'List of Sensitive Websites: ' + sensitiveWebsites.join(', ');

      chrome.runtime.sendMessage({
        type: iMsgReqType.sendUserActionInfo,
        user_id: user_id,
        timestamp: timestamp,
        event: event_number,
        comment: sensitiveListComment,
      });
    });
  } else {
    chrome.runtime.sendMessage({
      type: iMsgReqType.sendUserActionInfo,
      user_id: user_id,
      timestamp: timestamp,
      event: event_number,
      comment: comment,
    });
  }
}

export function localSendUserActionInfo (
  user_id: string,
  event_number: number,
  reportedSite = '',
  currentSite = '',
) {
  const timestamp = Date.now();

  const eventComments = {
    1: 'Interact with Moby-protected website without opening extension',
    2: 'Open popup on Moby-protected site',
    3: 'Open popup',
    4: 'Site saved as Moby-protected',
    5: 'Site saved as Moby-protected after being saved as unsafe',
    6: 'Site saved as unsafe',
    8: 'Moby-protected site removed',
    9: 'Unsafe site removed',
    11: 'Site Unblocked Temporarily',
  };

  //this is annoying
  let comment =
    eventComments[event_number as keyof typeof eventComments] ||
    'Unknown event';

  // Handling event 10 for reporting phishing
  if (event_number === 10) {
    comment = `Reported phishing on site ${reportedSite} by ${currentSite}`;
  }
  if (event_number === 7) {
    // Special handling for event 7 - save sensitive site info
    chrome.storage.local.get({ websiteList: {}, Points: 0 }, function (items) {
      const websiteList = items.websiteList;
      const points = items.Points;
      const sensitiveWebsites = [];
      for (const domain in websiteList) {
        if (websiteList[domain].isSensitive) {
          sensitiveWebsites.push(domain);
        }
      }
      const sensitiveListComment =
        'List of Sensitive Websites: ' + sensitiveWebsites.join(', ');
      fetch(
        `https://extension.mobyphish.com/user_data/${user_id}/${timestamp}/${event_number}/${sensitiveListComment}/${points}`,
      )
        .catch(reason => {
          console.warn('Failed to upload data: ', reason);
        })
        .finally(() => {});
    });
  } else {
    chrome.storage.local.get({ points: 0 }, function (items) {
      const points = items.points;

      fetch(
        `https://extension.mobyphish.com/user_data/${user_id}/${timestamp}/${event_number}/${comment}/${points}`,
      )
        .catch(reason => {
          console.warn('Failed to upload data: ', reason);
        })
        .finally(() => {});
    });
  }
}
