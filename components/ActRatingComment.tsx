import React, { useState } from 'react';
import { View } from 'react-native';
import Button from './Button';
import TextInput from './TextInput';

interface Props{
    handleSubmit: (comment: string, rating: number) => void
    loading: boolean
}

export default function ActRatingComment({handleSubmit, loading} : Props) {
    const [rating, setRating] = useState("")
    const [comment, setComment] = useState("")
    const [ratingHelperText, setRatingHelperText] = useState("")

    function isNumberBetweenOneAndFive(value: string): boolean {
        const num = Number(value);
        return Number.isInteger(num) && num >= 1 && num <= 5;
    }

    const handleSubmitLocal = (comment: string, rating: string) => {
        
        if(!isNumberBetweenOneAndFive(rating)){
            setRatingHelperText("Enter only a number between 0 and 5")
            return
        }
        
        handleSubmit(comment, Number(rating))
    }

    return (
        <View style={{width: "100%", display: "flex", gap: 25}}>
            <View style={{width: "100%", display: "flex", gap: 25}}>
                <TextInput  
                    label='Comment'
                    value={comment}
                    onChangeText={setComment}
                />
                <TextInput  
                    label='Rating (0-5)'
                    value={rating}
                    onChangeText={(t) => {setRating(t); setRatingHelperText("")}}
                    variant={ratingHelperText ? 'error' : 'default'}
                    helperText={ratingHelperText}
                />
            </View>
            <Button
                label='Save'
                onPress={() => handleSubmitLocal(comment, rating)}
                fullWidth={true}
                loading={loading}
            />
        </View>
    )
}