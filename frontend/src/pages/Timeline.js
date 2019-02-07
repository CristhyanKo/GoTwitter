import React, { Component } from 'react'
import twitterLogo from '../twitter.svg'
import api from '../services/api'
import './Timeline.css'
import Tweet from '../components/Tweet';
import socket from 'socket.io-client'

export default class Timeline extends Component {
    state = {
        tweets: [],
        newTweet: '',
    }

    handleNewTweet = async (e) => {
        if (e.keyCode !== 13) return

        const content = this.state.newTweet
        const author = localStorage.getItem('@GoTwitter:username')

        await api.post('tweets', { content, author })
        this.setState({ newTweet: '' })
    }

    async componentDidMount() {
        this.subscribeToEvents()
        const response = await api.get('tweets')
        this.setState({ tweets: response.data })
    }

    subscribeToEvents = () => {
        const io = socket('http://localhost:3000')
        io.on('tweet', data => {
            this.setState({ tweets: [data, ...this.state.tweets] })
        })
        io.on('like', data => {
            this.setState({ tweets: this.state.tweets.map(tweet => 
                tweet._id === data._id ? data : tweet
                ) })
        })
    }

    render() {
        return (
            <div className="timeline-wrapper">
                <img src={twitterLogo} alt="GoTwitter" height={24} />

                <form>
                    <textarea placeholder="O que está acontecendo?" value={this.state.newTweet} onKeyDown={this.handleNewTweet} onChange={env => this.setState({ newTweet: env.target.value })}></textarea>
                </form>

                {this.state.tweets.map(tweet =>
                    <ul className="tweet-list">
                        <Tweet key={tweet._id} tweet={tweet} />
                    </ul>
                )}
            </div>
        )
    }
}