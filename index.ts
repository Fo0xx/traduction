import { input } from '@inquirer/prompts';
import select, { Separator } from '@inquirer/select';
import main from './translation/translate';
import Queue from 'queue-promise';
import convertWordToTxt from './helpers/wordToTxt';

const validateNumber = (value: string) => !isNaN(parseInt(value)) || 'Please enter a number';

const handleSingleChapter = async (action: string) => {
    const chapterNumber = await input({
        message: `Which chapter do you want to ${action}?`,
        validate: validateNumber,
    });
    action === 'translate' ? main(chapterNumber) : console.log(`You want to download chapter ${chapterNumber}`);
};

const handleRangeOfChapters = async (action: string) => {
    const startChapter = await input({ message: `Which chapter do you want to ${action} first?`, validate: validateNumber });
    const endChapter = await input({ message: `Which chapter do you want to ${action} last?`, validate: validateNumber });

    if (action === 'translate') {
        const queue = new Queue({ concurrent: 1, interval: 1000, start: true });
        for (let i = parseInt(startChapter); i <= parseInt(endChapter); i++) {
            queue.enqueue(() => main(i.toString()));
        }
        queue.on('success', (result) => console.log(`Chapter ${result} is translated.`));
    } else if (action === 'download') {
        console.log(`You want to download chapters from ${startChapter} to ${endChapter}`);
    } else {
        convertWordToTxt(parseInt(startChapter), parseInt(endChapter));
    }
};

(async () => {
    const answers = await select({
        message: 'What do you want to do?',
        choices: [
            { name: 'Translate a chapter', value: 'translateChapter' },
            { name: 'Translate a range of chapters', value: 'translateRangeOfChapters' },
            { name: 'Compress a range of chapters', value: 'compressRangeOfChapters' },
            new Separator(),
            { name: 'Download chapters', value: 'downloadChapters' },
            { name: 'Download all chapters', value: 'downloadAllChapters' },
            { name: 'Download a range of chapters', value: 'downloadRangeOfChapters' }
        ],
    });

    const singleChapterActions = ['translateChapter', 'downloadChapters'];
    const rangeChapterActions = ['translateRangeOfChapters', 'downloadRangeOfChapters', 'compressRangeOfChapters'];

    if (singleChapterActions.includes(answers)) {
        await handleSingleChapter(answers === 'translateChapter' ? 'translate' : 'download');
    }

    if (rangeChapterActions.includes(answers)) {
        await handleRangeOfChapters(answers === 'translateRangeOfChapters' ? 'translate' : answers === 'downloadRangeOfChapters' ? 'download' : 'compress');
    }
})();